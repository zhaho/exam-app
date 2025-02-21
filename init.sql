CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content VARCHAR(100) NOT NULL,
    question_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exam  VARCHAR(100) NOT NULL,
    content VARCHAR(100) NOT NULL,
    correct_answer_id INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (correct_answer_id) REFERENCES answers(id) ON DELETE CASCADE
);

INSERT INTO answers (content, question_id) VALUES ('Answer 1',1);
INSERT INTO answers (content, question_id) VALUES ('Answer 2',1);
INSERT INTO answers (content, question_id) VALUES ('Answer 3',1);
INSERT INTO answers (content, question_id) VALUES ('Answer 4',1);

INSERT INTO questions (exam, content, correct_answer_id) VALUES ('WAP-ADO','What is the capital of France?', 1);
