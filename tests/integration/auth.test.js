import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';
import { v4 as uuidv4 } from 'uuid';

describe('Auth - Tests d\'intégration', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/v1/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const uniqueEmail = `jean-${uuidv4().slice(0,8)}@integration.com`;
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: uniqueEmail,
          password: 'password123',
          phone: '+237 655 000 111',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('devrait retourner 409 si l\'email existe déjà', async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'duplicate@test.com',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'duplicate@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe('Cet email est déjà utilisé');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const credentials = {
      firstName: 'Login',
      lastName: 'Test',
      email: 'login@test.com',
      password: 'password123',
    };

    beforeAll(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send(credentials);
    });

    it('devrait se connecter avec succès', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: credentials.email,
          password: credentials.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(credentials.email);
    });

    it('devrait retourner 401 pour des identifiants incorrects', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: credentials.email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Email ou mot de passe incorrect');
    });
  });
});