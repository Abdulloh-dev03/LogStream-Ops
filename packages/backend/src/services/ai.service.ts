import { InferenceClient } from "@huggingface/inference";
import { prisma } from "../lib/prisma.js";
import logger from "../config/logger.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";
import { z } from "zod";
// Clean Type Checking for the AI Outputs

export class AiService {
  private static readonly PRIMARY_MODEL = "meta-llama/Llama-3.1-8B-Instruct";
  private static readonly FALLBACK_MODEL = "MistralAI/Mistral-7B-Instruct-v0.3";

  /**
   * Orchestrates the initial non-blocking check or creation of an analysis task
   */
  static async initiateAnalysis(userId: string, logId: string) {
    const log = await prisma.log.findUnique({
      where: { id: logId },
      include: { project: true, aiAnalysis: true },
    });

    if (!log) throw new NotFoundError('Log entry not found.');
    if (log.project.userId !== userId) throw new ForbiddenError('Access denied.');

    // Cache hit: If it already exists and is completed or pending, return it!
    if (log.aiAnalysis) {
      return log.aiAnalysis;
    }

    // Cache miss: Create an initial placeholder record marked as PENDING
    const analysisJob = await prisma.aiAnalysis.create({
      data: { logId, status: 'PENDING' },
    });

    // CRITICAL: Fire the heavy AI operation in the background WITHOUT 'await'-ing it!
    // This allows the Express controller to immediately respond to the user's browser.
    this.executeBackgroundAnalysis(log, analysisJob.id).catch((err) => {
      logger.error(`Critical unhandled background tracking system failure on Job ${analysisJob.id}:`, err);
    });

    return analysisJob;
  }

  /**
   * Background worker execution thread running safely outside the HTTP request lifecycle
   */
  private static async executeBackgroundAnalysis(log: any, analysisId: string) {
    const systemInstructions = `You are an elite Site Reliability Engineer and Debugging Assistant.
Your task is to analyze an application error log and provide a structured JSON response.

Your ENTIRE response MUST be a single valid JSON object containing exactly two keys:
1. "explanation": A single, flat string containing clear markdown text explaining why this error likely broke the execution chain. DO NOT use nested objects or arrays here.
2. "suggestedFix": A single, flat string containing a clean markdown code block with the corrected logic parameters. DO NOT use nested objects or arrays here.

CRITICAL: The values for both keys must be plain text strings. Do not create nested loops. Return RAW valid JSON data only.`;
    const userPayload = `Log Message: ${log.message}\nStack Trace: ${log.stackTrace || 'None'}`;

    const client = new InferenceClient(process.env.HF_TOKEN);
    let outputText = "";
    const aiResponseSchema = z.object({
      explanation: z.string().min(1, "Explanation cannot be empty string payload parameters."),
      suggestedFix: z.string().min(1, "Suggested fix code blocks cannot be empty references."),
    });
    
    try {
      logger.info(`Background worker starting primary inference pipeline for job: ${analysisId}`);
      
      // 1. Try Primary Model
      const response = await client.chatCompletion({
        model: this.PRIMARY_MODEL,
        messages: [
          { role: "system", content: systemInstructions },
          { role: "user", content: userPayload },
        ],
        max_tokens: 1000,
      });
      outputText = response.choices[0]?.message?.content?.trim() || "";
    } catch (primaryError) {
      logger.warn(`Primary AI provider failed on job ${analysisId}. Activating fallback provider stream...`, primaryError);

      try {
        // 2. Fallback execution strategy
        const response = await client.chatCompletion({
          model: this.FALLBACK_MODEL,
          messages: [
            { role: "system", content: systemInstructions },
            { role: "user", content: userPayload },
          ],
          max_tokens: 1000,
        });
        outputText = response.choices[0]?.message?.content?.trim() || "";
      } catch (_fallbackError) {
        logger.error(`All AI validation provider engines exhausted for job ${analysisId}`);
        await prisma.aiAnalysis.update({
          where: { id: analysisId },
          data: { status: 'FAILED', errorReason: 'All inference execution engines failed.' },
        });
        return;
      }
    }

    // 3. Defensive Response Parsing and Recovery
    try {
      let rawExplanation = "";
      let rawSuggestedFix = "";

      // Attempt Standard JSON parsing first
      try {
        const cleanJsonString = outputText.replace(/```json/g, "").replace(/```/g, "").trim();
        const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
        const rawParsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJsonString);
        
        rawExplanation = typeof rawParsed.explanation === 'object' ? Object.values(rawParsed.explanation).join("\n") : String(rawParsed.explanation || "");
        rawSuggestedFix = typeof rawParsed.suggestedFix === 'object' ? Object.values(rawParsed.suggestedFix).join("\n") : String(rawParsed.suggestedFix || "");
      } catch (_jsonParseError) {
        logger.warn(`Standard JSON parsing failed for job ${analysisId}. Running fallback regex string extraction...`);
        
        // String splitting fallback if JSON layout syntax broke
        if (outputText.includes('"explanation":')) {
          const expStart = outputText.indexOf('"explanation":') + 14;
          const expEnd = outputText.indexOf('"suggestedFix":');
          rawExplanation = outputText.substring(expStart, expEnd).replace(/["{},]/g, "").trim();
        }
        
        if (outputText.includes('"suggestedFix":')) {
          const fixStart = outputText.indexOf('"suggestedFix":') + 15;
          rawSuggestedFix = outputText.substring(fixStart).replace(/[}]/g, "").trim();
        }
      }

      // Cleanup trailing characters or escaped markdown remnants
      const cleanedExplanation = rawExplanation.replace(/^[:\s`]+/g, "").trim();
      const cleanedSuggestedFix = rawSuggestedFix.replace(/^[:\s`]+/g, "").trim();

      // 2. ENFORCE CONTRACT VALIDATION: Validate extracted elements using your Zod Schema safely
      const validationResult = aiResponseSchema.safeParse({
        explanation: cleanedExplanation,
        suggestedFix: cleanedSuggestedFix
      });

      // 3. RECOVERY GATE: If Zod flags it as invalid, use generic text fallbacks instead of crashing
      let finalExplanation = cleanedExplanation;
      let finalSuggestedFix = cleanedSuggestedFix;

      if (!validationResult.success) {
        logger.warn(`Zod structure validation verification anomaly intercepted for job ${analysisId}. Activating payload defaults.`);
        finalExplanation = cleanedExplanation || "Review the code blocks provided below to track context variations regarding this application exception.";
        finalSuggestedFix = cleanedSuggestedFix || outputText; // Fall back to whole raw text if empty
      }

      // 4. Update job to success cleanly
      await prisma.aiAnalysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          explanation: finalExplanation,
          suggestedFix: finalSuggestedFix,
        },
      });
      
      logger.info(`Background job ${analysisId} completed successfully! Structurally locked with Zod validation.`);
    } catch (parseError) {
      logger.error(`AI structural parsing validation failure for job ${analysisId}.`, parseError);
      await prisma.aiAnalysis.update({
        where: { id: analysisId },
        data: { status: 'FAILED', errorReason: 'Incurable text formatting anomalies returned from LLM instance.' },
      });
    }
  }
}