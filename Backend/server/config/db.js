import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.DB_DATABASE, 
    process.env.DB_USERNAME, 
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

export const DB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a MySQL con Sequelize');
      } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error);
      }
};