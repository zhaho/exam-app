-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam VARCHAR(100) NOT NULL,
    content VARCHAR(8192) NOT NULL,
    source VARCHAR(255) NULL, -- Optional source
    question_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(2048) NOT NULL,
    question_id INT NOT NULL,
    correct_answer BOOLEAN NOT NULL DEFAULT FALSE, -- Correct answer flag
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Insert into questions first
INSERT INTO questions (exam, content, question_number) 
VALUES ('WAP-ADO', 'What is the capital of France?', 999);

-- Get the last inserted question's ID
SET @question_id = LAST_INSERT_ID();

-- Insert answers for this question
INSERT INTO answers (content, question_id, correct_answer) VALUES ('Answer 1', @question_id, FALSE);
INSERT INTO answers (content, question_id, correct_answer) VALUES ('Answer 2', @question_id, TRUE); -- Correct answer
INSERT INTO answers (content, question_id, correct_answer) VALUES ('Answer 3', @question_id, FALSE);
INSERT INTO answers (content, question_id, correct_answer) VALUES ('Answer 4', @question_id, FALSE);
