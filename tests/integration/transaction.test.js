import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

describe('Transaction - Tests d\'intégration', () => {
  let authToken;
  let accountId;
  let destAccountNumber;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    const uniqueEmail = `trans-${uuidv4().slice(0,8)}@test.com`;

    await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Transaction',
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

    const accountResponse = await request(app)
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        accountType: 'COURANT',
        initialDeposit: 100000,
      });

    if (accountResponse.status === 201) {
      accountId = accountResponse.body.data.id;
    }

    // Créer un compte destinataire
    const destEmail = `dest-${uuidv4().slice(0,8)}@test.com`;
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Dest',
        lastName: 'User',
        email: destEmail,
        password: 'password123',
      });

    const destLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: destEmail,
        password: 'password123',
      });

    const destToken = destLogin.body.data.token;

    const destAccount = await request(app)
      .post('/api/v1/accounts')
      .set('Authorization', `Bearer ${destToken}`)
      .send({
        accountType: 'COURANT',
        initialDeposit: 50000,
      });

    if (destAccount.status === 201) {
      destAccountNumber = destAccount.body.data.accountNumber;
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/transactions/:accountId/deposit', () => {
    it('devrait effectuer un dépôt avec succès', async () => {
      const response = await request(app)
        .post(`/api/v1/transactions/${accountId}/deposit`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 50000,
          description: 'Dépôt test',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.newBalance).toBe(150000);
      expect(response.body.data.transaction.type).toBe('DEPOT');
    });
  });

  describe('POST /api/v1/transactions/:accountId/withdraw', () => {
    it('devrait effectuer un retrait avec succès', async () => {
      const response = await request(app)
        .post(`/api/v1/transactions/${accountId}/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 20000,
          description: 'Retrait test',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.newBalance).toBe(130000);
    });

    it('devrait retourner 422 pour un solde insuffisant', async () => {
      const response = await request(app)
        .post(`/api/v1/transactions/${accountId}/withdraw`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 200000,
        });

      expect(response.status).toBe(422);
      expect(response.body.message).toBe('Solde insuffisant');
    });
  });

  describe('POST /api/v1/transactions/:accountId/transfer', () => {
    it('devrait effectuer un virement avec succès', async () => {
      const response = await request(app)
        .post(`/api/v1/transactions/${accountId}/transfer`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          toAccountNumber: destAccountNumber,
          amount: 30000,
          description: 'Virement test',
        });

      expect(response.status).toBe(200);
      expect(response.body.data.amount).toBe(30000);
    });
  });
});