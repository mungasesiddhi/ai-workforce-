import React from "react";

export default function ScoreChart({ score }) {
  return (
    <div>
      <h3>Score Chart</h3>
      <p>Your Score: {score}</p>
    </div>
  );
}