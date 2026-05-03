import React from 'react';
import './Timeline.css';

const timelineEvents = [
  { phase: "Phase 1", date: "April 19", states: "21 States/UTs", seats: 102 },
  { phase: "Phase 2", date: "April 26", states: "13 States/UTs", seats: 89 },
  { phase: "Phase 3", date: "May 7", states: "12 States/UTs", seats: 94 },
  { phase: "Phase 4", date: "May 13", states: "10 States/UTs", seats: 96 },
  { phase: "Phase 5", date: "May 20", states: "8 States/UTs", seats: 49 },
  { phase: "Phase 6", date: "May 25", states: "7 States/UTs", seats: 58 },
  { phase: "Phase 7", date: "June 1", states: "8 States/UTs", seats: 57 },
  { phase: "Result", date: "June 4", states: "All", seats: 543 }
];

export default function Timeline() {
  return (
    <div className="timeline-container animate-fade-in">
      <h1 className="page-title">Election Timeline (General Election Example)</h1>
      <p style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--text-secondary)' }}>
        A Gantt-style representation of the Lok Sabha election phases.
      </p>

      <div className="gantt-chart glass-panel">
        <div className="gantt-header">
          <div className="col-phase">Phase</div>
          <div className="col-date">Date</div>
          <div className="col-details">States & Seats</div>
          <div className="col-bar">Progress Chart</div>
        </div>
        
        <div className="gantt-body">
          {timelineEvents.map((event, index) => {
            // Calculate a simple width and offset for the visual bar based on the index
            // Assuming 8 phases roughly spread over 8 segments
            const leftOffset = index * 10;
            const barWidth = event.phase === 'Result' ? 20 : 15;
            const isResult = event.phase === 'Result';
            
            return (
              <div className={`gantt-row ${isResult ? 'result-row' : ''}`} key={index}>
                <div className="col-phase"><strong>{event.phase}</strong></div>
                <div className="col-date">{event.date}</div>
                <div className="col-details">
                  <span className="badge-states">{event.states}</span>
                  <span className="badge-seats">{event.seats} Seats</span>
                </div>
                <div className="col-bar">
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        left: `${leftOffset}%`, 
                        width: `${barWidth}%`,
                        background: isResult ? 'var(--green)' : 'var(--saffron)' 
                      }}
                    >
                      <span className="tooltip">{event.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
