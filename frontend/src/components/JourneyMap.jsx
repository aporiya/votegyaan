import React, { useState } from 'react';
import './JourneyMap.css';

const journeySteps = [
  {
    id: 1,
    title: "Voter Registration",
    subtitle: "(Matadan Panjikaran)",
    icon: "📝",
    details: [
      "Eligibility: Indian citizen, 18+ years as of Jan 1",
      "How to register: voters.eci.gov.in | Voter Helpline App",
      "Forms: Form 6 (new), Form 8 (correction), Form 7 (deletion)",
      "e-EPIC: Digital Voter ID card download",
      "Aadhaar-Voter ID linking process",
      "Check name on Electoral Roll"
    ]
  },
  {
    id: 2,
    title: "Candidate Filing & Campaigning",
    subtitle: "",
    icon: "📢",
    details: [
      "ECI announces election schedule",
      "Model Code of Conduct (MCC) comes into effect",
      "Nomination filing, scrutiny, withdrawal",
      "Security deposit: ₹25,000 (General) | ₹12,500 (SC/ST)",
      "Campaign rules: spending limits, rally permissions",
      "Campaign silence period: 48 hours before polling"
    ]
  },
  {
    id: 3,
    title: "Polling Day",
    subtitle: "(Matadan Diwas)",
    icon: "🗳️",
    details: [
      "Find your booth: Voter Helpline App / SMS to 1950",
      "Valid ID documents accepted at booth",
      "EVM (Electronic Voting Machine) — how to vote",
      "VVPAT — paper trail verification",
      "Indelible ink — purpose and importance",
      "NOTA option — what it means"
    ]
  },
  {
    id: 4,
    title: "Vote Counting",
    subtitle: "(Matganana)",
    icon: "📊",
    details: [
      "Counting Day process",
      "EVMs transported to counting centers under security",
      "Returning Officer oversees counting",
      "Round-by-round counting process",
      "Majority required: 272+ seats for Lok Sabha"
    ]
  },
  {
    id: 5,
    title: "Results & Government Formation",
    subtitle: "",
    icon: "🏛️",
    details: [
      "President invites majority party/coalition leader",
      "Oath-taking ceremony (Shapath Grahan)",
      "Cabinet formation",
      "By-elections (Upchunav) if seats fall vacant"
    ]
  }
];

export default function JourneyMap() {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <div className="journey-container animate-fade-in">
      <h1 className="page-title">Interactive Election Journey</h1>
      
      <div className="journey-layout">
        <div className="journey-timeline glass-panel">
          {journeySteps.map((step) => (
            <div 
              key={step.id}
              className={`timeline-step ${activeStep === step.id ? 'active' : ''}`}
              onClick={() => setActiveStep(step.id)}
            >
              <div className="step-indicator">
                <span className="step-number">{step.id}</span>
              </div>
              <div className="step-title-area">
                <div className="step-icon">{step.icon}</div>
                <div>
                  <div className="step-title">{step.title}</div>
                  {step.subtitle && <div className="step-subtitle">{step.subtitle}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="journey-details glass-panel">
          {journeySteps.filter(s => s.id === activeStep).map((step) => (
            <div key={step.id} className="details-content animate-fade-in">
              <h2>{step.icon} {step.title}</h2>
              {step.subtitle && <h3 style={{ color: 'var(--saffron)', marginBottom: '1.5rem' }}>{step.subtitle}</h3>}
              
              <ul className="details-list">
                {step.details.map((detail, idx) => (
                  <li key={idx}>
                    <span className="check-icon">✓</span> {detail}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
