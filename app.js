const { name } = require('ejs');
const express = require('express');
const PORT = 3000;
const app = express();

// Import the MariaDB Package
const mariadb = require('mariadb');

app.use(express.urlencoded({ extended: false}));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Configure the database connection
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '0508',
    database: 'blog'
});

// Function for connecting to the database
async function connect() {
    try {
        let conn = await pool.getConnection();
        console.log('Connected to the database');
        return conn;
    } catch (err) {
        console.log('Error connecting to the database: ' + err);
    }
}

app.get('/', (req, res) => {
    console.log("Hello, world! - server");
    res.render('home', { data: {}, errors: []});
});

app.get('/confirm', (req, res) => {
    res.send('You need to post to this page!');
});

app.post('/submit', async (req, res) => {
    const data = req.body;
    let isValid = true;
    let errors = [];
    if (data.title.trim() === "" || data.title.trim().length < 5) {
        isValid = false;
        errors.push("Title needs to be at least 5 characters");
    }
    if (data.content.trim() === "") {
        isValid = false;
        errors.push("Content cannot be empty");
    }
    if (data.author.trim() === "") {
        data.author = null;
    }
    if (!isValid) {
        res.render("home", {data: data, errors: errors});
        return;
    }
    const conn = await connect();
    await conn.query(`
        INSERT INTO posts (author, title, content)
        VALUES ("${data.author}", "${data.title}", "${data.content}");
    `);
    res.render('confirmation', { data : data });
});

app.get('/entries', async (req, res) => {
    const conn = await connect();
    const rows =
    await conn.query(`
        SELECT * FROM posts
        ORDER BY created_at DESC
    `);
    res.render('entries', { data : rows });
});

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`)
});