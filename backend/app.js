const express = require('express');
const cors = require("cors");
const app = express();
const mysql = require('mysql2');
const port = 3000;
require('dotenv').config();

app.use(express.json());
app.use(cors());

const dbConfig = {
  host: process.env.MYSQL_HOST, 
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

const createDbConnection = () => {
  return mysql.createConnection(dbConfig);
};

const connectToDatabase = () => {
  const db = createDbConnection();

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err.stack);
      setTimeout(connectToDatabase, 2000); 
    } else {
      console.log('Connected to the database');
      startServer(); 
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
          correct_answer: answer.correct_answer,
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
          source: question.source,
          question_number: question.question_number,
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
  const { exam, content, source, question_number, images = [], answers = [] } = req.body;

  // Check required fields
  if (!exam || !content) {
    return res.status(400).json({ error: 'Missing required fields: exam or content' });
  }

  // If source is not defined, or is set to empty value
  if (source !== undefined && source.trim() === "") {
    return res.status(400).json({ error: 'Source cannot be an empty string' });
  }

  const questionQuery = 'INSERT INTO questions (exam, content, question_number, source) VALUES (?, ?, ?, ?)';

  db.query(questionQuery, [exam, content, question_number, source], function (err, result) {
    if (err) {
      return res.status(500).json({ error: 'Database error inserting question', details: err.message });
    }

    const questionId = result.insertId; // Get newly inserted question ID

    // Insert answers (if any)
    const insertAnswers = answers.map(answer => {
      return new Promise((resolve, reject) => {
        const answerQuery = 'INSERT INTO answers (content, question_id, correct_answer) VALUES (?, ?, ?)';
        const correctAnswerValue = answer.correct_answer === true; // Ensure correct_answer is boolean
        db.query(answerQuery, [answer.content, questionId, correctAnswerValue], function (err, result) {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    // Insert images (if any)
    const insertImages = images.map(image => {
      return new Promise((resolve, reject) => {
        if (!image.image_url) return resolve(); // Skip if image_url is missing
        const imageQuery = 'INSERT INTO images (image_url, question_id) VALUES (?, ?)';
        db.query(imageQuery, [image.image_url, questionId], function (err, result) {
          if (err) reject(err);
          else resolve(result);
        });
      });
    });

    // Execute all insert queries
    Promise.all([...insertAnswers, ...insertImages])
      .then(() => {
        res.status(201).json({
          message: 'Question, answers, and images successfully added',
          question_id: questionId
        });
      })
      .catch(err => {
        res.status(500).json({ error: 'Error inserting answers or images', details: err.message });
      });
  });
});


app.get('/exams', (req, res) => {
  const exam = req.query.exam; 
  if (!exam) {
    return res.status(400).json({ error: "Exam code is required" });
  }

  const db = createDbConnection();

  db.query('SELECT * FROM questions WHERE exam = ? ORDER BY question_number ASC', [exam], (err, questions) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (questions.length === 0) {
      return res.status(404).json({ error: `No questions found for exam ${exam}` });
    }

    db.query('SELECT * FROM answers WHERE question_id IN (?) ORDER BY correct_answer DESC', [questions.map(q => q.id)], (err, answers) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      const answersMap = answers.reduce((acc, answer) => {
        if (!acc[answer.question_id]) {
          acc[answer.question_id] = [];
        }
        acc[answer.question_id].push({
          id: answer.id,
          content: answer.content,
          correct_answer: answer.correct_answer,
          created_at: answer.created_at
        });
        return acc;
      }, {});

      const examData = {
        exam: exam,
        questions: questions.map(question => {
          return {
            id: question.id,
            content: question.content,
            source: question.source,
            question_number: question.question_number,
            created_at: question.created_at,
            answers: answersMap[question.id] || []
          };
        })
      };

      res.json(examData);
    });
  });
});
