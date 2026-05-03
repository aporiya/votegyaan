import React, { useState } from 'react';
import './Glossary.css';

const glossaryTerms = [
  {
    term: "EVM",
    full: "Electronic Voting Machine",
    definition: "An electronic device used to record votes instead of paper ballots. Used in all Indian elections."
  },
  {
    term: "VVPAT",
    full: "Voter Verifiable Paper Audit Trail",
    definition: "An independent verification system attached to EVMs that allows voters to verify that their vote was cast correctly via a paper slip."
  },
  {
    term: "EPIC",
    full: "Electors Photo Identity Card",
    definition: "The official Voter ID card issued by the Election Commission of India to eligible voters."
  },
  {
    term: "MCC",
    full: "Model Code of Conduct",
    definition: "A set of guidelines issued by the ECI for conduct of political parties and candidates during elections."
  },
  {
    term: "Constituency",
    full: "Lok Sabha / Vidhan Sabha Constituency",
    definition: "A specific geographical area that elects one representative to the legislative body."
  },
  {
    term: "Returning Officer",
    full: "RO",
    definition: "The statutory authority to conduct elections in a constituency and declare the results."
  },
  {
    term: "NOTA",
    full: "None of the Above",
    definition: "A ballot option allowing voters to disapprove of all the candidates in a voting system."
  },
  {
    term: "By-election",
    full: "Upchunav",
    definition: "An election held to fill a political office that has become vacant between regularly scheduled elections."
  },
  {
    term: "Electoral Roll",
    full: "Voter List",
    definition: "The official list of persons who are entitled to vote in a specific constituency."
  },
  {
    term: "cVIGIL App",
    full: "Citizen Vigilance App",
    definition: "An app by ECI for citizens to report Model Code of Conduct violations during elections."
  }
];

export default function Glossary() {
  const [search, setSearch] = useState("");

  const filteredTerms = glossaryTerms.filter(item => 
    item.term.toLowerCase().includes(search.toLowerCase()) || 
    item.definition.toLowerCase().includes(search.toLowerCase()) ||
    item.full.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="glossary-container animate-fade-in">
      <h1 className="page-title">Glossary of Indian Election Terms</h1>
      
      <div className="search-bar-container">
        <input 
          type="text" 
          className="search-input glass-panel" 
          placeholder="Search terms... (e.g., EVM, NOTA)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="terms-grid">
        {filteredTerms.length > 0 ? (
          filteredTerms.map((item, index) => (
            <div className="term-card glass-panel" key={index}>
              <h2 className="term-title">{item.term}</h2>
              <div className="term-full">{item.full}</div>
              <p className="term-def">{item.definition}</p>
            </div>
          ))
        ) : (
          <div className="no-results">No terms found matching "{search}"</div>
        )}
      </div>
    </div>
  );
}
