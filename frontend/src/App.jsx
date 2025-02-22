import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons";
import ButtonCopyToRemNote from "./components/ButtonCopyToRemNote";

const App = () => {
  const [examData, setExamData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL + ":" + import.meta.env.VITE_API_PORT;
  const inputRef = useRef(null);

  // Updated textToCopy
  const [textToCopy, setTextToCopy] = useState("");

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const fetchData = async (query) => {
    if (!query) {
      console.error("Exam code is required");
      setExamData(null);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/exams`, {
        params: { exam: query },
      });

      if (response.data && response.data.questions) {
        setExamData(response.data);
        formatTextToCopy(response.data);
      } else {
        setExamData(null);
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setExamData(null);
    }
  };

  const handleSearch = () => {
    fetchData(searchQuery.trim());
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const formatTextToCopy = (data) => {
    let formattedText = "";

    data.questions.forEach((question, index) => {
      // Question
      formattedText += `Question ${question.question_number} :\n\t${question.content} >>A)\n`;

      // Answers
      question.answers.forEach((answer) => {
        formattedText += `\t\t${answer.content}\n`;
      });

      // Add a line break between questions
      formattedText += "\n";
    });

    setTextToCopy(formattedText);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-r from-black to-purple-900 text-white">
      {/* Faint Book Icon in the Top-Right Corner */}
      <FontAwesomeIcon
        icon={faBook}
        className="absolute text-[300px] text-white opacity-10 rotate-[15deg] top-[-50px] right-[-50px] -z-10"
      />

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Title with bouncing book icon */}
        <div className="flex items-center justify-center mb-8">
          <FontAwesomeIcon
            icon={faBook}
            className="text-6xl text-yellow-500 animate-bounce mr-4"
          />
          <h1 className="text-4xl font-bold">ExamSalabim 1.0</h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto flex items-center bg-white p-4 rounded-xl shadow-lg mb-8">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter exam code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow p-2 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg shadow-sm hover:bg-purple-700 transition-all duration-300"
          >
            Search
          </button>
        </div>

        {/* Display Exam Data */}
        {examData ? (
          <div className="bg-white text-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300">
            <ButtonCopyToRemNote copyText={textToCopy} buttonText="RemNote" />
            {/* Exam Title */}
            <h2 className="text-3xl font-bold text-center text-purple-700 mb-4">
              Exam: {examData.exam}
            </h2>
            {/* Questions & Answers */}
            <div className="space-y-6">
              {examData.questions.map((question) => (
                <div key={question.id} className="p-4 border-b border-gray-300">
                  {/* Question */}
                  <h3 className="text-xl font-semibold text-gray-400">Question {question.question_number}</h3>
                  <h3 className="mb-4 font-semibold">{question.content}</h3>
                  {/* <p className="text-sm text-gray-500">Source: {question.source}</p> */}

                  {/* Answers */}
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    {question.answers.map((answer) => (
                      <li key={answer.id} className="text-gray-800">
                        {answer.content}{" "}
                        {answer.correct_answer ? (
                          <span className="text-green-600 font-bold">(✔ Correct)</span>
                        ) : (
                          ""
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-xl">No exam data available</p>
        )}
      </div>
    </div>
  );
};

export default App;
