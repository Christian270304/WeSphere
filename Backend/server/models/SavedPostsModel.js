import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { Post } from "./PostModel.js";
import { User } from "./UserModel.js";

export const SavedPosts = sequelize.define("saved_posts", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true, allowNull: false },
    post_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: Post, key: "id" } },
    user_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: User, key: "id" }},
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    timestamps: false,
});