import app from "./app.js";
import { Server } from 'socket.io';
import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado:', socket.id);

  socket.on('joinChats', (chatIds) => {
    chatIds.forEach(chatId => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} se unió al chat ${chatId}`);
    });
  });

  socket.on('sendMessage', ({ chatId, sender_id, content }) => {
    console.log(`Mensaje enviado al chat ${chatId} por ${sender_id}: ${content}`);
    io.to(chatId).emit('newMessage', {
      chatId,
      sender_id,
      content,
      created_at: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
