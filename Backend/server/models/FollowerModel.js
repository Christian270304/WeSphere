import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { User } from "./UserModel.js";

export const Follower = sequelize.define("followers", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    follower_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: "id" }  // Foreign Key
    },
    following_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false, 
        references: { model: User, key: "id" }  // Foreign Key
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
    timestamps: false,
});

// **Relaciones**
User.hasMany(Follower, { foreignKey: "follower_id", as: "Following" });
User.hasMany(Follower, { foreignKey: "following_id", as: "Followers" });
Follower.belongsTo(User, { foreignKey: "follower_id", as: "FollowerUser" });
Follower.belongsTo(User, { foreignKey: "following_id", as: "FollowingUser" });

