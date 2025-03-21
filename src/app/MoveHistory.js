import React from 'react';

const formatMoveHistory = (moveHistory) => {
  if (!moveHistory || moveHistory.length === 0) return [];
  
  const formattedMoves = [];
  
  for (let i = 0; i < moveHistory.length; i += 2) {
    const whiteMove = moveHistory[i];
    const blackMove = i + 1 < moveHistory.length ? moveHistory[i + 1] : null;
    
    formattedMoves.push({
      moveNumber: Math.floor(i / 2) + 1,
      whiteMove: whiteMove ? whiteMove.san : '',
      blackMove: blackMove ? blackMove.san : ''
    });
  }
  
  return formattedMoves;
};

const MoveHistory = ({ moveHistory, onMoveClick }) => {
  const formattedMoves = formatMoveHistory(moveHistory);
  
  return (
    <div 
      style={{ 
        width: "200px", 
        height: "50vh", 
        marginLeft: "20px", 
        backgroundColor: "#2a2a2a", 
        borderRadius: "10px", 
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
        overflowY: "auto",
        padding: "10px",
        color: "white",
        fontFamily: "'Arial', sans-serif"
      }}
      aria-label="Move history"
    >
      <h3 style={{ 
        textAlign: "center", 
        borderBottom: "1px solid #444", 
        paddingBottom: "8px", 
        margin: "0 0 10px 0",
        fontSize: "16px",
        fontWeight: "bold"
      }}>
        Move History
      </h3>
      
      {formattedMoves.length === 0 ? (
        <p style={{ textAlign: "center", color: "#AAA", fontSize: "12px" }}>No moves yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {formattedMoves.map((movePair, index) => (
            <div 
              key={index} 
              style={{ 
                display: "grid",
                gridTemplateColumns: "30px 1fr 1fr",
                marginBottom: "4px",
                backgroundColor: index % 2 === 0 ? "#3a3a3a" : "#2a2a2a",
                borderRadius: "4px"
              }}
            >
              {/* Move number */}
              <div style={{ 
                padding: "6px 4px", 
                color: "#999", 
                fontSize: "14px",
                textAlign: "center",
                fontWeight: "bold"
              }}>
                {movePair.moveNumber}.
              </div>
              
              {/* White's move */}
              <div 
                onClick={() => movePair.whiteMove && onMoveClick(index * 2)}
                style={{
                  padding: "6px 4px",
                  fontSize: "14px",
                  fontWeight: movePair.whiteMove.includes('+') ? "bold" : "normal",
                  color: "#f0f0f0",
                  cursor: movePair.whiteMove ? "pointer" : "default",
                  backgroundColor: movePair.whiteMove.includes('#') ? "rgba(255, 50, 50, 0.2)" : 
                                movePair.whiteMove.includes('+') ? "rgba(255, 180, 0, 0.2)" : "transparent",
                  borderRadius: "3px",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (movePair.whiteMove) e.target.style.backgroundColor = "rgba(105, 148, 235, 0.3)";
                }}
                onMouseLeave={(e) => {
                  if (movePair.whiteMove.includes('#')) {
                    e.target.style.backgroundColor = "rgba(255, 50, 50, 0.2)";
                  } else if (movePair.whiteMove.includes('+')) {
                    e.target.style.backgroundColor = "rgba(255, 180, 0, 0.2)";
                  } else {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
                role="button"
                tabIndex={movePair.whiteMove ? 0 : -1}
                aria-label={movePair.whiteMove ? `White move ${movePair.moveNumber}: ${movePair.whiteMove}` : ""}
              >
                {movePair.whiteMove}
              </div>
              
              {/* Black's move */}
              <div 
                onClick={() => movePair.blackMove && onMoveClick(index * 2 + 1)}
                style={{
                  padding: "6px 4px",
                  fontSize: "14px",
                  fontWeight: movePair.blackMove && movePair.blackMove.includes('+') ? "bold" : "normal",
                  color: "#f0f0f0",
                  cursor: movePair.blackMove ? "pointer" : "default",
                  backgroundColor: movePair.blackMove && movePair.blackMove.includes('#') ? "rgba(255, 50, 50, 0.2)" : 
                                movePair.blackMove && movePair.blackMove.includes('+') ? "rgba(255, 180, 0, 0.2)" : "transparent",
                  borderRadius: "3px",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (movePair.blackMove) e.target.style.backgroundColor = "rgba(105, 148, 235, 0.3)";
                }}
                onMouseLeave={(e) => {
                  if (movePair.blackMove && movePair.blackMove.includes('#')) {
                    e.target.style.backgroundColor = "rgba(255, 50, 50, 0.2)";
                  } else if (movePair.blackMove && movePair.blackMove.includes('+')) {
                    e.target.style.backgroundColor = "rgba(255, 180, 0, 0.2)";
                  } else {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
                role="button"
                tabIndex={movePair.blackMove ? 0 : -1}
                aria-label={movePair.blackMove ? `Black move ${movePair.moveNumber}: ${movePair.blackMove}` : ""}
              >
                {movePair.blackMove}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MoveHistory;