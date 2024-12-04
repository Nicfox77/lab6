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
app.use(express.urlencoded({ extended: true })); // Add this line
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
    let dob = req.body.dob;
    let dod = req.body.dod;
    let sex = req.body.sex;
    let profession = req.body.profession;
    let country = req.body.country;
    let portrait = req.body.portrait;
    let biography = req.body.biography
    let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let params = [fName, lName, dob, dod, sex, profession, country, portrait, biography];
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
                dod = ?,
                sex = ?,
                profession = ?,
                country = ?,
                portrait = ?,
                biography = ?
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

app.get("/quotes", async function(req, res){
    let sql = `SELECT * FROM q_quotes ORDER BY authorId`;
    const [rows] = await conn.query(sql);
    res.render("quoteList", {"quotes": rows});
});

app.get("/quote/edit", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `SELECT * FROM q_quotes WHERE quoteId = ${quoteId}`;
    const [rows] = await conn.query(sql);
    res.render("editQuote", {"quoteInfo": rows});
});

app.post("/quote/edit", async function(req, res){
    let sql = `UPDATE q_quotes SET quote = ?, authorId = ?,
                    category = ?,
                    likes = ?
                    WHERE quoteId = ?`
    let params = [req.body.quote, req.body.authorId, req.body.category, req.body.likes, req.body.quoteId];
    const [rows] = await conn.query(sql, params);
    res.redirect("/quotes");
});

app.get("/quote/delete", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `DELETE FROM q_quotes WHERE quoteId = ${quoteId}`;
    const [rows] = await conn.query(sql);
    res.redirect("/quotes");
});

app.get("/quote/new", async function(req, res){
    res.render("newQuote");

});

app.post("/quote/new", async function(req, res){
    let sql = `INSERT INTO q_quotes (quote, authorId, category, likes) VALUES (?, ?, ?, ?)`;
    let params = [req.body.quote, req.body.authorId, req.body.category, req.body.likes];
    const [rows] = await conn.query(sql, params);
    res.render("newQuote", {"message": "Quote added!"});
});