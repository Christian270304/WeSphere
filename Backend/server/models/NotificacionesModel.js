import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./UserModel.js";

export const Notificacion = sequelize.define('notifications', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
    type: { type: DataTypes.ENUM('like', 'comment', 'follow', 'message'), allowNull: false },
    reference_id: { type: DataTypes.INTEGER, allowNull: false },
    is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
},{
    timestamps: false,
});