"use client"

import React from 'react'

export function ComicLoader() {
  return (
    <>
      <div className="comic-loader">
        <div className="comic-panel">
          <div className="speech-bubble burst-1">POW!</div>
          <div className="speech-bubble burst-2">ZOOM!</div>
          <div className="speech-bubble burst-3">BAM!</div>
          <div className="action-lines"></div>
        </div>
      </div>
      
      <style jsx>{`
        .comic-loader {
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 120px;
        }
        
        .comic-panel {
          position: relative;
          background: #f9f9f9;
          border: 2px solid #333;
          box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
          padding: 0.5rem;
          border-radius: 4px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          transform: rotate(-2deg);
        }
        
        .speech-bubble {
          background: white;
          color: #6b46c1;
          padding: 0.4rem 0.7rem;
          border-radius: 0.5rem;
          font-weight: bold;
          font-family: "Bangers", "Comic Sans MS", cursive, sans-serif;
          letter-spacing: 1px;
          position: relative;
          font-size: 0.9rem;
          transform: scale(0);
          opacity: 0;
          border: 2px solid #333;
          box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.15);
          z-index: 10;
          transform-origin: center;
          margin: 0 -8px;
        }
        
        .speech-bubble:after {
          content: '';
          position: absolute;
          bottom: -0.6rem;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0.6rem 0.6rem 0;
          border-style: solid;
          border-color: #333 transparent transparent;
          filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.1));
        }
        
        .speech-bubble:before {
          content: '';
          position: absolute;
          bottom: -0.4rem;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0.5rem 0.5rem 0;
          border-style: solid;
          border-color: white transparent transparent;
          z-index: 1;
        }
        
        .burst-1 {
          background: #FFEB3B;
          transform: rotate(-5deg);
          animation: burstIn 0.6s 0s forwards, burstOut 0.6s 1.2s forwards;
          clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
          border-radius: 0;
        }
        
        .burst-1:after, .burst-1:before {
          display: none;
        }
        
        .burst-2 {
          background: #FF5722;
          color: white;
          transform: rotate(5deg);
          animation: burstIn 0.6s 0.3s forwards, burstOut 0.6s 1.5s forwards;
        }
        
        .burst-3 {
          background: #2196F3;
          color: white;
          transform: rotate(-3deg);
          animation: burstIn 0.6s 0.6s forwards, burstOut 0.6s 1.8s forwards;
        }
        
        .action-lines {
          position: absolute;
          inset: -10px;
          background: 
            radial-gradient(circle at 50% 50%, transparent 65%, #f9f9f9 70%),
            repeating-conic-gradient(from 0deg, #333 0deg 10deg, transparent 10deg 20deg);
          opacity: 0.1;
          mix-blend-mode: multiply;
          animation: rotate 20s linear infinite;
        }
        
        @keyframes burstIn {
          0% { transform: scale(0) rotate(-5deg); opacity: 0; }
          60% { transform: scale(1.3) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        @keyframes burstOut {
          0% { transform: scale(1) rotate(0deg); opacity: 1; }
          40% { transform: scale(1.2) rotate(-3deg); opacity: 1; }
          100% { transform: scale(0) rotate(5deg); opacity: 0; }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Animation to loop continuously */
        .comic-panel {
          animation: pulse 2.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1) rotate(-2deg); }
          50% { transform: scale(1.05) rotate(1deg); }
          100% { transform: scale(1) rotate(-2deg); }
        }
      `}</style>
    </>
  )
} 