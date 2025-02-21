import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div>
      <h1>Exam Questions</h1>

      {/* Search Bar */}
      <div>
        <input
          type="text"
          placeholder="Search for exam..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Display filtered data */}
      <div>
        {filteredData.length === 0 ? (
          <p>No exams found</p>
        ) : (
          filteredData.map((item) => (
            <div key={item.id} style={{ marginBottom: "20px" }}>
              <h2>{item.exam}</h2>
              <p>{item.content}</p>
              <ul>
                {item.answers.map((answer) => (
                  <li key={answer.id}>{answer.content}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
