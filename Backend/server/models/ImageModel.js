import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Image = sequelize.define('images', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hash: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: false,
});