import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Chat } from "./ChatsModel.js";
import { User } from "./UserModel.js";

export const ChatMember = sequelize.define('chatMember', {
    chat_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Chat, key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
},{
    timestamps: false,
    primaryKey: ["chat_id", "user_id"],
    tableName: "chatMember",
});

