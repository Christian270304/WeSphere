import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Message = sequelize.define('messages', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
},{
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
    timestamps: false,
});