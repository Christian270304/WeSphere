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

// Relación: Un usuario tiene muchos posts
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relación: Un usuario tiene una imagen de perfil y un banner
User.belongsTo(Media, { foreignKey: 'profile_picture', as: 'profileImage' });
User.belongsTo(Media, { foreignKey: 'banner', as: 'bannerImage' });

// Relación: Un post tiene una imagen
Post.belongsTo(Media, { foreignKey: 'mediaId', as: 'media' });

// Relación: Seguidores
Follower.belongsTo(User, { foreignKey: 'follower_id', as: 'FollowerUser' });
Follower.belongsTo(User, { foreignKey: 'following_id', as: 'FollowingUser' });
User.hasMany(Follower, { foreignKey: 'follower_id', as: 'Following' });
User.hasMany(Follower, { foreignKey: 'following_id', as: 'Followers' });

// Relación: Un post tiene muchos likes
Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
Like.belongsTo(Post, { foreignKey: 'post_id' });

// Relación: Un like pertenece a un usuario
User.hasMany(Like, { foreignKey: 'user_id', as: 'userLikes' });
Like.belongsTo(User, { foreignKey: 'user_id' });

// Relación: Un post tiene muchos comentarios
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

// Relación: Un comentario pertenece a un usuario
Comment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id', as: 'userComments' });

// Un Chat tiene muchos ChatMembers
Chat.hasMany(ChatMember, { foreignKey: "chat_id" });
ChatMember.belongsTo(Chat, { foreignKey: "chat_id" });

// Un Chat tiene muchos Mensajes
Chat.hasMany(Message, { foreignKey: "chat_id" });
Message.belongsTo(Chat, { foreignKey: "chat_id" });

// Un Usuario puede pertenecer a muchos Chats
User.hasMany(ChatMember, { foreignKey: "user_id" });
ChatMember.belongsTo(User, { foreignKey: "user_id" });

// Un Mensaje pertenece a un Usuario
Message.belongsTo(User, { foreignKey: "sender_id" });
User.hasMany(Message, { foreignKey: "sender_id", as: "userMessages" });

User.hasMany(AuthProvider, { foreignKey: 'user_id', as: 'authProviders' });
AuthProvider.belongsTo(User, { foreignKey: 'user_id', as: 'userProvider' });

// Un Usuario tiene muchas Notificaciones
User.hasMany(Notificacion, { foreignKey: 'user_id', as: 'notifications' });
Notificacion.belongsTo(User, { foreignKey: 'user_id', as: 'userNotification' });

// Relación: Un usuario puede guardar muchos posts
User.hasMany(SavedPosts, { foreignKey: 'user_id', as: 'savedPosts' });
SavedPosts.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Relación: Un post puede ser guardado por muchos usuarios
Post.hasMany(SavedPosts, { foreignKey: 'post_id', as: 'savedByUsers' });
SavedPosts.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

