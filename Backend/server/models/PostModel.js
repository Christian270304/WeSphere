import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const Post = sequelize.define('posts', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  mediaId: { type: DataTypes.INTEGER, allowNull: true },
  likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  allow_likes: { type: DataTypes.BOOLEAN, defaultValue: true },
  allow_comments: { type: DataTypes.BOOLEAN, defaultValue: true },
  allow_saving: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
});