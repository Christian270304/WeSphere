import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DB, sequelize } from './config/db.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true, 
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Conectar a la base de datos y sincronizar modelos
(async () => {
  await DB();
  await sequelize.sync(); // Crea tablas si no existen
  console.log("✅ Base de datos sincronizada");
})();

export default app;

