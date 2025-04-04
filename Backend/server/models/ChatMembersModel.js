import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const ChatMember = sequelize.define('chatMember', {
    chat_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
},{
    timestamps: false,
});