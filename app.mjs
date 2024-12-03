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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Database Connection
const conn = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Test Database Connection
app.get('/dbTest', async (req, res) => {
    try {
        const [rows] = await conn.query('SELECT CURDATE() AS today');
        res.send(rows[0].today);
    } catch (error) {
        console.error('Database connection failed:', error);
        res.status(500).send('Database connection failed');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get("/author/new", (req, res) => {
    res.render("newAuthor");
});

app.post("/author/new", async function(req, res){
    let fName = req.body.fName;
    let lName = req.body.lName;
    let birthDate = req.body.birthDate;
    let sql = `INSERT INTO q_authors
             (firstName, lastName, dob)
              VALUES (?, ?, ?)`;
    let params = [fName, lName, birthDate];
    const [rows] = await conn.query(sql, params);
    res.render("newAuthor",
        {"message": "Author added!"});
});

app.get("/authors", async function(req, res){
    let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
    const [rows] = await conn.query(sql);
    res.render("authorList", {"authors":rows});
});


app.get("/author/edit", async function(req, res){


    let authorId = req.query.authorId;


    let sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO
        FROM q_authors
        WHERE authorId =  ${authorId}`;
    const [rows] = await conn.query(sql);
    res.render("editAuthor", {"authorInfo":rows});
});


app.post("/author/edit", async function(req, res){
    let sql = `UPDATE q_authors
            SET firstName = ?,
                lastName = ?,
                dob = ?,
                sex = ?
            WHERE authorId =  ?`;


    let params = [req.body.fName,
        req.body.lName, req.body.dob,
        req.body.sex,req.body.authorId];
    const [rows] = await conn.query(sql,params);
    res.redirect("/authors");
});

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;
    let sql = `DELETE FROM q_authors
            WHERE authorId = ${authorId}`;
    const [rows] = await conn.query(sql);
    res.redirect("/authors");
});
