import React from "react";

function QuestionCard({question}) {

  return (
    <div style={{
      background:"#f9f9ff",
      padding:"20px",
      borderRadius:"10px",
      margin:"20px",
      boxShadow:"0px 4px 8px rgba(0,0,0,0.1)"
    }}>
      <h3>❓ {question}</h3>

      <button style={{margin:"10px"}}>Beginner</button>
      <button style={{margin:"10px"}}>Intermediate</button>
      <button style={{margin:"10px"}}>Advanced</button>
    </div>
  );

}

export default QuestionCard;