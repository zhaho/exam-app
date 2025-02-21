const express = require('express');
const mysql = require('mysql2');
const app = express();
const port = 3000;

const dbConfig = {
  host: 'db', // Docker service name of MySQL
  user: 'exam_user',
  password: 'exam_password',
  database: 'exam_db'
};

// Function to create the MySQL connection
const createDbConnection = () => {
  return mysql.createConnection(dbConfig);
};

// Function to connect with retry mechanism
const connectToDatabase = () => {
  const db = createDbConnection();

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      setTimeout(connectToDatabase, 2000); // Retry after 2 seconds if the connection fails
    } else {
      console.log('Connected to the database');
      startServer(); // Start the server only after DB connection is successful
    }
  });
};

// Start the Express server
const startServer = () => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
};

// Check connection to MySQL
connectToDatabase();



app.get('/data', (req, res) => {
  const db = createDbConnection();

  // Fetch all questions
  db.query('SELECT * FROM questions', (err, questions) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Fetch all answers
    db.query('SELECT * FROM answers', (err, answers) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Map answers by question_id for easy lookup
      const answersMap = answers.reduce((acc, answer) => {
        if (!acc[answer.question_id]) {
          acc[answer.question_id] = [];
        }
        acc[answer.question_id].push({
          id: answer.id,
          content: answer.content,
          created_at: answer.created_at
        });
        return acc;
      }, {});

      // Now, for each question, attach the corresponding answers
      const questionsWithAnswers = questions.map(question => {
        return {
          id: question.id,
          exam: question.exam,
          content: question.content,
          correct_answer_id: question.correct_answer_id,
          created_at: question.created_at,
          answers: answersMap[question.id] || [] // Attach answers if available
        };
      });

      // Send the response with questions and answers
      res.json(questionsWithAnswers);
    });
  });
});
