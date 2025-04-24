import { sequelize } from '../config/db.js';
import { User } from './UserModel.js';
import { Post } from './PostModel.js';
import { Follower } from './FollowerModel.js';
import { Media } from './MediaModel.js';
import { Like } from './LikeModel.js';
import { Comment } from './CommentsModel.js';
import { Chat } from './ChatsModel.js';
import { Message } from './MessagesModel.js';
import { ChatMember } from './ChatMembersModel.js';
import { AuthProvider } from './AuthProvidersModel.js';
import { Notificacion } from './NotificacionesModel.js';
import { SavedPosts } from './SavedPostsModel.js';

// Configurar relaciones
import './relationships.js';

// Exportar todos los modelos y la conexión
export { sequelize, User, Post, Follower, Media, Like, Comment, Chat, Message, ChatMember, AuthProvider, Notificacion, SavedPosts };