import React, { useState, useEffect } from 'react';
import './Quiz.css';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try fetching from backend, fallback to local data if fails
    fetch('http://localhost:8080/api/quiz')
      .then(res => res.json())
      .then(data => {
        setQuestions(data.questions);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backend quiz failed, using fallback data", err);
        setQuestions([
          {
            "question": "What is the minimum voting age in India?",
            "options": ["16 years", "18 years", "21 years", "25 years"],
            "correct": "18 years",
            "explanation": "The voting age in India is 18 years, lowered from 21 years in 1989 by the 61st Amendment."
          },
          {
            "question": "In which year was NOTA introduced in Indian elections?",
            "options": ["2001", "2010", "2013", "2019"],
            "correct": "2013",
            "explanation": "NOTA was introduced in 2013 following a Supreme Court directive."
          }
        ]);
        setLoading(false);
      });
  }, []);

  const handleOptionClick = (option) => {
    if (selectedOption !== null) return; // Prevent multiple clicks
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption === questions[currentIdx].correct) {
      setScore(score + 1);
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentIdx(0);
    setShowResult(false);
    setSelectedOption(null);
  };

  if (loading) {
    return <div className="quiz-container animate-fade-in"><h2 style={{textAlign: 'center'}}>Loading Quiz...</h2></div>;
  }

  if (showResult) {
    return (
      <div className="quiz-container animate-fade-in">
        <div className="quiz-card glass-panel" style={{textAlign: 'center', padding: '3rem 2rem'}}>
          <h1 style={{fontSize: '3rem', marginBottom: '1rem', color: 'var(--saffron)'}}>Quiz Complete!</h1>
          <h2>Your Score: {score} out of {questions.length}</h2>
          <p style={{margin: '2rem 0', color: 'var(--text-secondary)'}}>
            {score === questions.length ? 'Perfect score! You are a true VoteGyaan expert.' : 'Great job! Keep learning about the election process.'}
          </p>
          <button className="btn-primary" onClick={restartQuiz}>Restart Quiz</button>
        </div>
      </div>
    );
  }

  const question = questions[currentIdx];

  return (
    <div className="quiz-container animate-fade-in">
      <h1 className="page-title">Civic Knowledge Quiz</h1>
      
      <div className="quiz-card glass-panel">
        <div className="quiz-header">
          <span className="question-count">Question {currentIdx + 1}/{questions.length}</span>
          <span className="current-score">Score: {score}</span>
        </div>
        
        <div className="question-text">
          {question.question}
        </div>

        <div className="options-container">
          {question.options.map((option, index) => {
            let className = "quiz-option btn-outline";
            if (selectedOption !== null) {
              if (option === question.correct) {
                className += " correct";
              } else if (option === selectedOption) {
                className += " incorrect";
              } else {
                className += " disabled";
              }
            }

            return (
              <button 
                key={index} 
                className={className} 
                onClick={() => handleOptionClick(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selectedOption !== null && (
          <div className="explanation-box animate-fade-in">
            <strong>{selectedOption === question.correct ? '✅ Correct!' : '❌ Incorrect.'}</strong>
            <p>{question.explanation}</p>
            <div style={{textAlign: 'right', marginTop: '1rem'}}>
              <button className="btn-primary" onClick={handleNext}>
                {currentIdx + 1 === questions.length ? 'Finish' : 'Next Question'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
