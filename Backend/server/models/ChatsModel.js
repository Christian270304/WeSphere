import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Chat = sequelize.define('chat', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    is_group: { type: DataTypes.BOOLEAN, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
},{
    timestamps: false,
});