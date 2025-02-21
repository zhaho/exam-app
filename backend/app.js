const express = require('express');
const app = express();
const mysql = require('mysql2');
const port = 3000;

app.use(express.json());

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

// Endpoints

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

app.post('/data', (req, res) => {
  const db = createDbConnection();
  const { exam, content, answers } = req.body;

  // Ensure the required fields are present
  if (!exam || !content || !answers || answers.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Insert the question into the questions table
  const questionQuery = 'INSERT INTO questions (exam, content, correct_answer_id) VALUES (?, ?, ?)';
  const correctAnswer = answers.find(answer => answer.correct); // Find the correct answer

  if (!correctAnswer) {
    return res.status(400).json({ error: 'No correct answer provided' });
  }

  db.query(questionQuery, [exam, content, null], function (err, result) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    const questionId = result.insertId;

    // Now insert the answers into the answers table
    const answerQueries = answers.map(answer => {
      return new Promise((resolve, reject) => {
        const insertAnswerQuery = 'INSERT INTO answers (content, question_id) VALUES (?, ?)';
        db.query(insertAnswerQuery, [answer.content, questionId], function (err, result) {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    });

    // Wait for all the answers to be inserted before setting the correct_answer_id
    Promise.all(answerQueries)
      .then(() => {
        // Get the id of the correct answer from the answers table
        const correctAnswerQuery = 'SELECT id FROM answers WHERE content = ? AND question_id = ? LIMIT 1';
        db.query(correctAnswerQuery, [correctAnswer.content, questionId], function (err, results) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          const correctAnswerId = results[0]?.id;

          if (!correctAnswerId) {
            res.status(500).json({ error: 'Unable to find correct answer ID' });
            return;
          }

          // Update the question to set the correct_answer_id
          const updateQuestionQuery = 'UPDATE questions SET correct_answer_id = ? WHERE id = ?';
          db.query(updateQuestionQuery, [correctAnswerId, questionId], function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }

            // Send a response confirming success
            res.status(201).json({
              message: 'Question and answers successfully added',
              question_id: questionId
            });
          });
        });
      })
      .catch(err => {
        res.status(500).json({ error: 'Error inserting answers', details: err.message });
      });
  });
});
