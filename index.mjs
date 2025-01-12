import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Database connection pool
const pool = mysql.createPool({
    host: "zuhra-totakhail.online",
    user: "zuhratot_webuser",
    password: "CSUMB-cst336",
    database: "zuhratot_login",
    connectionLimit: 10,
    waitForConnections: true,
});

// Routes

// Home route
app.get('/', (req, res) => {
    pool.getConnection()
        .then(conn => {
            return conn.query('SELECT * FROM exam_monsters ORDER BY score DESC LIMIT 5')
                .then(([pokemons]) => {
                    conn.release();
                    res.render('home', { pokemons, page: 'home' });
                })
                .catch(err => {
                    conn.release();
                    console.error(err);
                    res.status(500).send("Error fetching data.");
                });
        });
});
app.get('/add', async (req, res) => {
    try {
      const conn = await pool.getConnection();
  
      // Fetch monsters list if needed
      const [monsters] = await conn.query(`
        SELECT m.*, e.elementName AS elementName
        FROM exam_monsters m
        JOIN exam_elements e ON m.elementId = e.elementId
      `);
  
      // Fetch elements for the dropdown
      const [elements] = await conn.query('SELECT * FROM exam_elements');
  
      conn.release();
  
      // Pass 'monsters' and 'elements' to the template
      res.render('add', { pokemons: monsters, elements, page: 'add' });
    } catch (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Error fetching data.");
    }
  });
  

// Add new monster form
app.post('/add/new', async (req, res) => {
    try {
      const { name, description, elementId, firstCaught, imgName, score } = req.body;
  
      // Check if all required fields are provided
      if (!name || !description || !elementId || !firstCaught || !imgName || !score) {
        return res.status(400).send('All fields are required!');
      }
  
      // Insert into database
      const conn = await pool.getConnection();
      await conn.query(
        'INSERT INTO exam_monsters (name, description, elementId, firstCaught, imgName, score) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, elementId, firstCaught, imgName, score]
      );
      conn.release();
  
      // Redirect back to the 'add' page
      res.redirect('/add');
    } catch (err) {
      console.error("Error adding new monster:", err);
      res.status(500).send("Error adding monster.");
    }
  });
  
// Update monster form
app.get('/update/:id', async (req, res) => {
    const monsterId = req.params.id;
    console.log("Requested monsterId:", monsterId);
    const conn = await pool.getConnection();
    const [monster] = await conn.query('SELECT * FROM exam_monsters WHERE monsterId = ?', [monsterId]);
    conn.release();

    if (!monster.length) {
        console.error("Monster not found with monsterId:", monsterId);
        return res.status(404).send('Monster not found.');
    }

    res.render('update', { monster: monster[0], page: 'update' });
});

app.post('/update/:id', async (req, res) => {
    const monsterId = req.params.id;
    const newScore = req.body.score;

    console.log("Updating monsterId:", monsterId, "with new score:", newScore);

    try {
        // Get a database connection from the pool
        const conn = await pool.getConnection();

        // Perform the update query
        const [result] = await conn.query(
            'UPDATE exam_monsters SET score = ? WHERE monsterId = ?',
            [newScore, monsterId]
        );

        conn.release(); // Release the connection back to the pool

        console.log("Score updated successfully:", result);

        // Redirect to the homepage after successful update
        res.redirect('/');
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send('Error updating the score.');
    }
});


// Quiz route
app.get('/quiz', (req, res) => {
    pool.getConnection()
        .then(conn => {
            return conn.query('SELECT * FROM exam_monsters')
                .then(([rows]) => {
                    conn.release();
                    const randomPokemon = rows[Math.floor(Math.random() * rows.length)];
                    res.render('quiz', { pokemon: randomPokemon, page: 'quiz' });
                })
                .catch(err => {
                    conn.release();
                    console.error(err);
                    res.status(500).send("Error fetching data.");
                });
        });
});
// Web API to grade the answer
app.post("/quiz", (req, res) => {
    const userAnswer = req.body.element;
    const correctElement = req.body.correctElement;

    const isCorrect = userAnswer === correctElement;
    res.json({ correct: isCorrect });
});


// Database test route
app.get('/dbTest', (req, res) => {
    pool.getConnection()
        .then(conn => {
            return conn.query('SELECT CURDATE()')
                .then(([rows]) => {
                    conn.release();
                    res.send(rows);
                })
                .catch(err => {
                    conn.release();
                    console.error(err);
                    res.status(500).send("Error testing database.");
                });
        });
});

// Server
app.listen(3000, () => {
    console.log("Express server running on http://localhost:3000");
});
