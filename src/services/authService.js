const User = require('../models/user.js');
const { generateToken } = require('../config/jwt.js');

class AuthService {
  async register(userData) {
    const { firstName, lastName, email, password, phone } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone: phone || null,
    });

    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    await user.update({ lastLogin: new Date() });

    const token = generateToken({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user.toJSON();

    return { user: userWithoutPassword, token };
  }

  async getUserById(id) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    return user;
  }

  async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
  }
}

module.exports = new AuthService();