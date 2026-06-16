import dotenv from 'dotenv';
import { beforeAll, afterAll, afterEach } from 'vitest';
import sequelize from '../src/config/database.js';

dotenv.config({ path: '.env.test' });

beforeAll(async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Base de données de test initialisée');
  } catch (error) {
    console.error('❌ Erreur initialisation DB test:', error.message);
  }
});

afterEach(async () => {
  try {
    const models = sequelize.models;
    for (const model of Object.values(models)) {
      await model.destroy({ where: {}, truncate: true, cascade: true });
    }
  } catch (error) {
    console.error('❌ Erreur nettoyage DB test:', error.message);
  }
});

afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Connexion à la base de données fermée');
  } catch (error) {
    console.error('❌ Erreur fermeture DB test:', error.message);
  }
});