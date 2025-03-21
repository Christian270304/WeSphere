import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Follower = sequelize.define('followers', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  follower_id: { type: DataTypes.INTEGER, allowNull: false },
  following_id: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
});

