import app from "./app.js";
import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://wesphere-9q3n6u6vp-christian270304s-projects.vercel.app/",
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

  socket.on('send_notification', ({ userId, notification }) => {
    console.log(`🔔 Enviando notificación al usuario ${userId}:`, notification);
    io.to(`user:${userId}`).emit('receive_notification', notification);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

export { io };
