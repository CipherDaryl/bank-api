import { describe, it, expect, beforeEach } from 'vitest';
import authService from '../../src/services/authService.js';
import User from '../../src/models/user.js';
import { v4 as uuidv4 } from 'uuid';

describe('AuthService - Tests unitaires', () => {
  const getUniqueEmail = () => `test-${uuidv4().slice(0,8)}@test.com`;
  let userData;

  beforeEach(() => {
    userData = {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: getUniqueEmail(),
      password: 'password123',
      phone: '+237 655 000 111',
    };
  });

  describe('register()', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const user = await authService.register(userData);
      expect(user).toHaveProperty('id');
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
      expect(user.email).toBe(userData.email);
      expect(user).not.toHaveProperty('password');
    });

    it('devrait retourner une erreur si l\'email existe déjà', async () => {
      await authService.register(userData);
      await expect(authService.register(userData)).rejects.toThrow('Cet email est déjà utilisé');
    });

    it('devrait hacher le mot de passe avant de sauvegarder', async () => {
      const user = await authService.register(userData);
      const dbUser = await User.findByPk(user.id);
      expect(dbUser.password).not.toBe(userData.password);
      expect(dbUser.password).toHaveLength(60);
    });
  });

  describe('login()', () => {
    beforeEach(async () => {
      await authService.register(userData);
    });

    it('devrait se connecter avec les bonnes identifiants', async () => {
      const result = await authService.login(userData.email, userData.password);
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(userData.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('devrait retourner une erreur avec un email incorrect', async () => {
      await expect(authService.login('wrong@email.com', userData.password))
        .rejects.toThrow('Email ou mot de passe incorrect');
    });

    it('devrait retourner une erreur avec un mot de passe incorrect', async () => {
      await expect(authService.login(userData.email, 'wrongpassword'))
        .rejects.toThrow('Email ou mot de passe incorrect');
    });
  });

  describe('getUserById()', () => {
    it('devrait retourner l\'utilisateur sans le mot de passe', async () => {
      const registered = await authService.register(userData);
      const user = await authService.getUserById(registered.id);
      expect(user).toHaveProperty('id');
      expect(user.password).toBeUndefined();
    });

    it('devrait retourner une erreur si l\'utilisateur n\'existe pas', async () => {
      await expect(authService.getUserById('non-existent-id'))
        .rejects.toThrow('Utilisateur non trouvé');
    });
  });
});