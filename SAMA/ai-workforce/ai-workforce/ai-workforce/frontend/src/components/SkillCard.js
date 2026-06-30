import React from "react";

function SkillCard({skill, level}) {

  return (
    <div style={{
      background:"#ffffff",
      padding:"20px",
      borderRadius:"12px",
      boxShadow:"0px 5px 10px rgba(0,0,0,0.1)",
      margin:"10px",
      width:"200px",
      textAlign:"center"
    }}>
      <h3>💡 {skill}</h3>
      <p>Level: {level}</p>
    </div>
  );

}

export default SkillCard;