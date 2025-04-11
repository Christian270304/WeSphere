import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./UserModel.js";

export const AuthProvider = sequelize.define('auth_providers', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }, onDelete: "CASCADE", onUpdate: "CASCADE" },
    provider: { type: DataTypes.STRING, allowNull: false },
    provider_id: { type: DataTypes.STRING, allowNull: false },
},{
    timestamps: false,
});