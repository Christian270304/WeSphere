import { DataTypes } from "sequelize";
import { Op , sequelize } from "../config/db.js";
import { User } from "./UserModel.js";
import { Follower } from "./FollowerModel.js";

export const Post = sequelize.define("posts", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, defaultValue: "" },
  likes_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  allow_comments: { type: DataTypes.BOOLEAN, defaultValue: true },
  allow_likes: { type: DataTypes.BOOLEAN, defaultValue: true },
  allow_saving: { type: DataTypes.BOOLEAN, defaultValue: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  timestamps: false,
});

// **Relación con User**
User.hasMany(Post, { foreignKey: "user_id", as: "posts" });
Post.belongsTo(User, { foreignKey: "user_id", as: "user" });

export const getRecommendedPosts = async (user_id) => {
  try {
      // Obtener los IDs de los usuarios que sigue el usuario actual
      const followedUsers = await Follower.findAll({
          where: { follower_id: user_id },
          attributes: ['following_id']
      });

      const followedIds = followedUsers.map(follow => follow.following_id);

      // Buscar posts recomendados usando los criterios definidos
      const posts = await Post.findAll({
          include: [
              { model: User, as: "user", attributes: ['id', 'username'] }
          ],
          where: {
              created_at: { [Op.gte]: sequelize.literal('NOW() - INTERVAL 7 DAY') } // Últimos 7 días
          },
          order: [
              [sequelize.literal(`CASE WHEN "user_id" IN (${followedIds.join(',') || 0}) THEN 1 ELSE 2 END`), 'ASC'], // Primero los seguidos
              ['likes_count', 'DESC'],  // Luego por likes
              ['comments_count', 'DESC'], // Luego por comentarios
              [sequelize.literal('RAND()')] // Aleatorizar un poco
          ],
          limit: 20
      });
      
      return posts;
  } catch (error) {
      // // console.error('Error en getRecommendedPosts:', error);
      // // return error;
  }
};