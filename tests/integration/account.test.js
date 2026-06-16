import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

describe('Account - Tests d\'intégration', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const uniqueEmail = `account-${uuidv4().slice(0,8)}@test.com`;

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Account',
        lastName: 'User',
        email: uniqueEmail,
        password: 'password123',
      });

    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: uniqueEmail,
        password: 'password123',
      });

    authToken = loginResponse.body.data.token;
    userId = loginResponse.body.data.user.id;
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/accounts', () => {
    it('devrait créer un compte avec succès', async () => {
      const response = await request(app)
        .post('/api/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountType: 'EPARGNE',
          initialDeposit: 50000,
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('accountNumber');
      expect(Number(response.body.data.balance)).toBe(50000);
      expect(response.body.data.status).toBe('ACTIF');
    });

    it('devrait retourner 409 pour un compte de même type', async () => {
      await request(app)
        .post('/api/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountType: 'COURANT',
          initialDeposit: 50000,
        });

      const response = await request(app)
        .post('/api/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          accountType: 'COURANT',
          initialDeposit: 50000,
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('déjà un compte');
    });
  });

  describe('GET /api/v1/accounts', () => {
    it('devrait lister les comptes de l\'utilisateur', async () => {
      const response = await request(app)
        .get('/api/v1/accounts')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });
});