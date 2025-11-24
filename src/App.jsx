import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import TeacherPage from './pages/TeacherPage';
import ParentPage from './pages/ParentPage';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/parent" replace />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/parent" element={<ParentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
