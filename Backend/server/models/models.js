import { sequelize } from '../config/db.js';
import { User } from './UserModel.js';
import { Post } from './PostModel.js';
import { Follower } from './FollowerModel.js';
import { Image } from './ImageModel.js';

// Configurar relaciones
import './relationships.js';

// Exportar todos los modelos y la conexión
export { sequelize, User, Post, Follower, Image };