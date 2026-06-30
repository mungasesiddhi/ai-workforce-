import React from "react";

function JobCard({job, demand}) {

  return (
    <div style={{
      background:"#fff",
      borderRadius:"12px",
      padding:"20px",
      margin:"20px",
      boxShadow:"0px 5px 10px rgba(0,0,0,0.15)"
    }}>
      <h2>💼 {job}</h2>
      <p>🔥 Market Demand: {demand}</p>

      <button style={{
        background:"#4CAF50",
        color:"white",
        border:"none",
        padding:"10px 20px",
        borderRadius:"8px"
      }}>
        View Career Path
      </button>
    </div>
  );

}

export default JobCard;