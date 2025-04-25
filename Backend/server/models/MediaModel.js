import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Media = sequelize.define('media', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hash: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: false,
});