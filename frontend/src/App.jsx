import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import JourneyMap from './components/JourneyMap';
import Timeline from './components/Timeline';
import Glossary from './components/Glossary';
import Quiz from './components/Quiz';
import ChatAssistant from './components/ChatAssistant';
import { Map, Calendar, BookText, HelpCircle, MessageSquare } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar glass-panel animate-fade-in" style={{ padding: '1rem 2rem' }}>
          <div className="logo">
            <span role="img" aria-label="India">🇮🇳</span> VoteGyaan
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
              <Map size={18} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} /> Journey
            </NavLink>
            <NavLink to="/timeline" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Calendar size={18} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} /> Timeline
            </NavLink>
            <NavLink to="/glossary" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <BookText size={18} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} /> Glossary
            </NavLink>
            <NavLink to="/quiz" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <HelpCircle size={18} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} /> Quiz
            </NavLink>
            <NavLink to="/chat" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <MessageSquare size={18} style={{ display: 'inline', marginRight: 5, verticalAlign: 'text-bottom' }} /> Smart Q&A
            </NavLink>
          </div>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<JourneyMap />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/chat" element={<ChatAssistant />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
