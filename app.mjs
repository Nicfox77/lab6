import express from 'express';
import mysql from 'mysql2/promise';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3006;

// Middleware
app.use(express.static(path.resolve('./public')));
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Database Connection
const conn = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});