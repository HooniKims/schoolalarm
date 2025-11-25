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
          <Route path="/" element={<Navigate to="/parents" replace />} />
          <Route path="/teacher" element={<TeacherPage />} />
          <Route path="/parents" element={<ParentPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
