import { describe, test, expect } from 'vitest';
import { z } from 'zod';

// Re-declare the validation contract schema matching your production layer
const AiResponseSchema = z.object({
  explanation: z.string().min(1),
  suggestedFix: z.string().min(1),
});

/**
 * A direct extraction mockup of your production defensive parser code block
 */
function runDefensiveParser(outputText: string): { explanation: string; suggestedFix: string } {
  let rawExplanation = "";
  let rawSuggestedFix = "";

  try {
    // Attempt standard JSON parsing first
    const cleanJsonString = outputText.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonMatch = cleanJsonString.match(/\{[\s\S]*\}/);
    const rawParsed = JSON.parse(jsonMatch ? jsonMatch[0] : cleanJsonString);
    
    rawExplanation = typeof rawParsed.explanation === 'object' ? Object.values(rawParsed.explanation).join("\n") : String(rawParsed.explanation || "");
    rawSuggestedFix = typeof rawParsed.suggestedFix === 'object' ? Object.values(rawParsed.suggestedFix).join("\n") : String(rawParsed.suggestedFix || "");
  } catch (_jsonParseError) {
    // Fallback string manipulation splitting if JSON tokens are misaligned
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

  const cleanedExplanation = rawExplanation.replace(/^[:\s`]+/g, "").trim();
  const cleanedSuggestedFix = rawSuggestedFix.replace(/^[:\s`]+/g, "").trim();

  // Enforce validation schema checks
  const validationResult = AiResponseSchema.safeParse({
    explanation: cleanedExplanation,
    suggestedFix: cleanedSuggestedFix
  });

  if (!validationResult.success) {
    return {
      explanation: cleanedExplanation || "Review the log context crashes.",
      suggestedFix: cleanedSuggestedFix || outputText
    };
  }

  return validationResult.data;
}

describe('AI Response Defensive Parser - Unit Test Suite', () => {
  
  test('Should perfectly parse flawless, valid JSON strings', () => {
    const perfectJson = JSON.stringify({
      explanation: 'The array map variable was undefined.',
      suggestedFix: 'Initialize with default empty array block.'
    });

    const result = runDefensiveParser(perfectJson);
    expect(result.explanation).toBe('The array map variable was undefined.');
    expect(result.suggestedFix).toBe('Initialize with default empty array block.');
  });

  test('Should safely recover from markdown wrappers and conversational chat prefixes', () => {
    const wrappedAiOutput = `Sure! Here is your custom log telemetry analysis output layout:
\`\`\`json
{
  "explanation": "Database pool limits reached.",
  "suggestedFix": "Increase connection bounds settings values."
}
\`\`\``;

    const result = runDefensiveParser(wrappedAiOutput);
    expect(result.explanation).toBe('Database pool limits reached.');
    expect(result.suggestedFix).toBe('Increase connection bounds settings values.');
  });

  test('Should handle the invalid curly-brace nested object string array mistake (Our first error)', () => {
    const invalidBraceStructure = `{
      "explanation": {
        "### TypeError: Map exception",
        "* Prop data passed was empty configuration nodes."
      },
      "suggestedFix": {
        "* Check your hook definitions parameters."
      }
    }`;

    const result = runDefensiveParser(invalidBraceStructure);
    expect(result.explanation).toContain('### TypeError: Map exception');
    expect(result.suggestedFix).toContain('* Check your hook definitions parameters.');
  });

  test('Should survive and stabilize when backticks break outer JSON quotes (Our second error)', () => {
    const brokenQuoteBackticks = `{\n  "explanation": "Runtime crash scenario context.",\n  "suggestedFix": \`\`\`\n// Safe handling wrapper code\nif (data) return data.map();\n\`\`\`\n}`;

    const result = runDefensiveParser(brokenQuoteBackticks);
    expect(result.explanation).toBe('Runtime crash scenario context.');
    expect(result.suggestedFix).toContain('if (data) return data.map();');
  });
});