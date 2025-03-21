import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { DB, sequelize } from './config/db.js';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js';


dotenv.config();

const app = express();



app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Conectar a la base de datos y sincronizar modelos
(async () => {
  await DB();
  await sequelize.sync(); // Crea tablas si no existen
  console.log("✅ Base de datos sincronizada");
})();

export default app;

