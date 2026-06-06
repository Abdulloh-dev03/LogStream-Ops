import request from 'supertest';
import { describe, test, expect } from 'vitest';
import { generateKeyPreview, hashApiKey } from '../../utils/crypto.js';
import { prisma } from '../../lib/prisma.js';
import app from '../../app.js';


describe('POST /api/ingest - Log Ingestion Engine', () => {

  test('Should successfully ingest a log and return 201 when payload is fully valid', async () => {
    // Create isolated user and project context right here
    const user = await prisma.user.create({
      data: { email: 'valid-sre@example.com', password: 'mockpassword123' },
    });

    // Use a known raw key, store only its hash + preview
    const rawApiKey = 'ls_live_test_key_authentication_token_abc123';
    const project = await prisma.project.create({
      data: {
        name: 'Sarah Shop Test Environment',
        hashedApiKey: hashApiKey(rawApiKey),
        keyPreview: generateKeyPreview(rawApiKey),
        userId: user.id,
      },
    });

    const response = await request(app)
      .post('/api/ingest')
      .send({
        apiKey: rawApiKey,
        message: 'ReferenceError: React is not defined',
        url: 'https://sarahshop.com/home',
        level: 'CRITICAL',
        stackTrace: 'at Home (home.tsx:4:12)',
        browser: 'Firefox 126',
        os: 'Windows 11',
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message', 'Log ingested successfully');

    // Verify lastUsedAt was updated
    const updatedProject = await prisma.project.findUnique({ where: { id: project.id } });
    expect(updatedProject?.lastUsedAt).not.toBeNull();
  });

  test('Should return 400 Bad Request if mandatory fields are missing', async () => {
    const rawApiKey = 'ls_live_missing_fields_token_xyz_pad_to_valid';

    const response = await request(app)
      .post('/api/ingest')
      .send({
        apiKey: rawApiKey,
        // message and url are intentionally omitted
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Validation failed');
  });

  test('Should return 404 Not Found if the API key does not exist in the database', async () => {
    const response = await request(app)
      .post('/api/ingest')
      .send({
        apiKey: 'ls_live_fake_non_existent_key_999999',
        message: 'Crash report',
        url: 'https://test.com',
        level: 'ERROR',
      });

    expect(response.status).toBe(404);
  });
});