import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook } from "@fortawesome/free-solid-svg-icons"; // Import the book icon

const App = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Fetch data from the API
  useEffect(() => {
    axios.get(`${apiUrl}/data`)
      .then((response) => {
        setData(response.data);
        setFilteredData(response.data);  // Initialize with all data
      })
      .catch((error) => {
        console.error("There was an error fetching the data:", error);
      });
  }, []);

  // Handle the search
  const handleSearch = () => {
    if (searchQuery.trim() === "") {
      setFilteredData(data);  // If search query is empty, show all data
    } else {
      const filtered = data.filter((item) =>
        item.exam.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black to-purple-900 text-white">
      <div className="container mx-auto px-6 py-12">
        {/* Title with bouncing book icon */}
        <div className="flex items-center justify-center mb-8">
          <FontAwesomeIcon
            icon={faBook}
            className="text-6xl text-yellow-500 animate-bounce mr-4" // Bouncing effect and margin-right
          />
          <h1 className="text-4xl font-bold">ExamSalabim 1.0</h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto flex items-center bg-white p-4 rounded-xl shadow-lg mb-8">
          <input
            type="text"
            placeholder="Search for exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-2 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSearch}
            className="ml-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Search
          </button>
        </div>

        {/* Display filtered data */}
        <div className="space-y-6">
          {filteredData.length === 0 ? (
            <p className="text-center text-xl">No exams found</p>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white text-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition duration-300"
              >
                <h2 className="text-2xl font-semibold">{item.exam}</h2>
                <p className="text-gray-600 my-4">{item.content}</p>
                <ul className="list-disc pl-5 space-y-2">
                  {item.answers.map((answer) => (
                    <li key={answer.id} className="text-gray-800">
                      {answer.content}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
