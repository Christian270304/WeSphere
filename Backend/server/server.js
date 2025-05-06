import app from "./app.js";
import { Server } from 'socket.io';
import { createServer } from 'http';
import { AuthController } from "./controllers/AuthController.js";

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://wesphere.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('join_user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`🧍‍♂️ Usuario ${userId} se unió a su sala personal`);
  });

  socket.on('join_chat', (chatId) => {
    socket.join(`chat:${chatId}`);
    console.log(`💬 Usuario se unió al chat ${chatId}`);
  });

  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat:${chatId}`);
    console.log(`🚪 Usuario salió del chat ${chatId}`);
  });

  socket.on('send_message', ({ chatId, message, senderId }) => {

    const fullMessage = {
      chatId,
      sender_id: senderId,
      content: message,
      created_at: new Date()
    };

    io.to(`chat:${chatId}`).emit('receive_message', fullMessage);

    // const otherUserId = message.receiverId;
    // io.to(`user:${otherUserId}`).emit('new_message_notification', { chatId, message });
  });

  socket.on('send_notification', ({ userId, otherUserId, notification }) => {
    // Guardar la notificación en la base de datos 
    const newNotification = AuthController.saveNotification(userId, otherUserId, notification);

    if (!newNotification) return;
    console.log(`🔔 El usuario ${userId} ha enviando una notificación al usuario ${otherUserId}:`, notification);
    io.to(`user:${otherUserId}`).emit('receive_notification',{userId, notification});
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export { io };
