import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define('users', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  profile_picture: { type: DataTypes.STRING, defaultValue: "" },
  banner: { type: DataTypes.STRING, defaultValue: "" },
  bio: { type: DataTypes.STRING, defaultValue: "" },
  is_private: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false, // Desactiva createdAt y updatedAt
});
