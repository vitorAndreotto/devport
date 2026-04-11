import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'devport',
  password: process.env.DB_PASSWORD || 'devport',
  database: process.env.DB_NAME || 'devport',
  migrations: ['dist/migrations/*.js'],
  entities: ['dist/**/*.entity.js'],
});
