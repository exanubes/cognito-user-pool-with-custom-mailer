import React, { FormEvent, useEffect, useState } from "react";
import { BrowserRouter as Router, Link, Routes, Route } from "react-router-dom";
import "./App.css";
import { CommentType } from "./components/Comment";
import { LogIn } from "./components/LogIn";
import { Register } from "./components/Register";
import { Verify } from "./components/Verify";
import { AddComment } from "./components/AddComment";
import { Navigation } from "./components/Navigation";
import { CommentSection } from "./components/CommentSec";

export const accessTokenKey = "accessToken";

function App() {
  const [comments, setComments] = useState<CommentType[]>([]);
  useEffect(() => {
    fetch("http://localhost:3000/comments")
      .then((res) => res.json())
      .then(setComments);
  }, []);

  return (
    <Router>
      <div className="App h-[100vh] grid justify-center items-top mt-80 content-start gap-4">
        <Navigation />
        <CommentSection comments={comments} />
        <Routes>
          <Route path="/verify" element={<Verify />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/add-comment"
            element={<AddComment onSubmit={setComments} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
