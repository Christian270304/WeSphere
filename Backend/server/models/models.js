import { sequelize } from '../config/db.js';
import { User } from './UserModel.js';
import { Post } from './PostModel.js';
import { Follower } from './FollowerModel.js';
import { Image } from './ImageModel.js';
import { Like } from './LikeModel.js';
import { Comment } from './CommentsModel.js';

// Configurar relaciones
import './relationships.js';

// Exportar todos los modelos y la conexión
export { sequelize, User, Post, Follower, Image, Like, Comment };