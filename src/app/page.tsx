"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";
import { Suspense } from "react";
import { Chessboard } from "react-chessboard";
import Slideshow from "./slideshow";
import SearchParamsComponent from "./SearchParamsComponent";
import { useRouter } from "next/navigation";

// Initialize socket connection outside component to prevent multiple connections
const socket = io("http://localhost:5001");

const ChessGame = () => {
  const router = useRouter();
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [gameId, setGameId] = useState(null);
  const [playerColor, setPlayerColor] = useState(null);
  const [username, setUsername] = useState("User");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(null);
  const [kingInCheck, setKingInCheck] = useState(false);
  const [kingInCheckSquare, setKingInCheckSquare] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [fromSquare, setFromSquare] = useState(null); 
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [moveHistory, setMoveHistory] = useState([]);
  
  // Audio refs instead of state to prevent unnecessary rerenders
  const audioRef = useRef(null);
  const checkAudioRef = useRef(null);

  const formatMoveHistory = useCallback((moveHistory) => {
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
  }, []);

  // Move history 
  const MoveHistory = ({ moveHistory, onMoveClick }) => {
    const formattedMoves = formatMoveHistory(moveHistory);
    
    return (
      <div style={{ 
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
      }}>
        <h3 style={{ 
          textAlign: "center", 
          borderBottom: "1px solid #444", 
          paddingBottom: "8px", 
          margin: "0 0 10px 0",
          fontSize: "16px",
          fontWeight: "bold"
        }}>Move History</h3>
        
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
                  aria-label={`White's move ${movePair.moveNumber}: ${movePair.whiteMove}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      movePair.whiteMove && onMoveClick(index * 2);
                    }
                  }}
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
                  aria-label={`Black's move ${movePair.moveNumber}: ${movePair.blackMove || 'Not made yet'}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      movePair.blackMove && onMoveClick(index * 2 + 1);
                    }
                  }}
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

  // Implemented the handleMoveClick function to jump to specific board positions
  const handleMoveClick = (moveIndex) => {
    try {
      // Create a new chess instance
      const tempChess = new Chess();
      
      // Apply all moves up to the selected index
      const movesToApply = moveHistory.slice(0, moveIndex + 1);
      
      for (const move of movesToApply) {
        tempChess.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion || 'q'
        });
      }
      
      // Update the FEN to show this position
      setFen(tempChess.fen());
      
      // Don't update the main chess object as we're just viewing history
    } catch (error) {
      console.error("Error applying historical moves:", error);
    }
  };

  // Initialize audio only once
  useEffect(() => {
    // Initialize background audio
    audioRef.current = new Audio("/audios/audio.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.02;
    
    // Initialize check sound
    checkAudioRef.current = new Audio("/audios/check.mp3");
    checkAudioRef.current.volume = 1.0;
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (checkAudioRef.current) {
        checkAudioRef.current.pause();
        checkAudioRef.current.src = "";
      }
    };
  }, []);

  // Handle background audio play
  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current) {
        audioRef.current.play().catch((error) => {
          // Audio autoplay may be blocked by browser policy
          // This is expected behavior, no need to log error
        });
      }
      window.removeEventListener("click", playAudio);
    };

    window.addEventListener("click", playAudio);
    return () => window.removeEventListener("click", playAudio);
  }, []);

  // Game initialization and socket connection setup
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGameId = params.get("gameId");

    if (urlGameId) {
      setGameId(urlGameId);
      socket.emit("joinGame", urlGameId);
    } else {
      const newGameId = Math.random().toString(36).substring(2, 10);
      setGameId(newGameId);
      router.push(`/?gameId=${newGameId}`);
      socket.emit("joinGame", newGameId);
    }

    // Setup socket event handlers
    const handlePlayerColor = (color) => {
      setPlayerColor(color);
      setUsername(color === "w" ? "White" : "Black");
    };

    const handleSpectator = () => {
      setPlayerColor("spectator");
      setUsername(`Spectator ${Math.floor(Math.random() * 1000)}`);
    };

    const handleGameState = (newFen) => {
      try {
        const tempChess = new Chess(newFen);
        setFen(newFen);
        chess.load(newFen);
        checkForCheck();
        
        const history = tempChess.history({ verbose: true });
        if (history.length > 0) {
          setMoveHistory(history);
        }
      } catch (error) {
        console.error("Error processing game state:", error);
      }
    };

    const handleMoveMade = (moveData) => {
      setMoveHistory((prev) => {
        // Check if this move is already in history to avoid duplicates
        const moveExists = prev.some(move => 
          move.from === moveData.from && 
          move.to === moveData.to
        );
        return moveExists ? prev : [...prev, moveData];
      });
    };

    const handleGameOver = ({ winner }) => {
      setGameOver(
        winner === "draw"
          ? "Game Over: Draw"
          : `Game Over: ${winner === "w" ? "White Wins!" : "Black Wins!"}`
      );
    };

    const handleChatMessage = ({ user, text }) => {
      setMessages((prev) => [...prev, { user, text }]);
    };

    const handleTypingIndicator = (user) => {
      setTypingUser(user);
      setIsTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    };

    // Register event handlers
    socket.on("playerColor", handlePlayerColor);
    socket.on("spectator", handleSpectator);
    socket.on("gameState", handleGameState);
    socket.on("moveMade", handleMoveMade);
    socket.on("gameOver", handleGameOver);
    socket.on("chatMessage", handleChatMessage);
    socket.on("typing", handleTypingIndicator);

    // Clean up event listeners on component unmount
    return () => {
      socket.off("playerColor", handlePlayerColor);
      socket.off("spectator", handleSpectator);
      socket.off("gameState", handleGameState);
      socket.off("moveMade", handleMoveMade);
      socket.off("gameOver", handleGameOver);
      socket.off("chatMessage", handleChatMessage);
      socket.off("typing", handleTypingIndicator);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [router]);

  // Memoize handlers with useCallback to prevent unnecessary recreations
  const handleMove = useCallback((move) => {
    if (
      (playerColor === "w" && chess.turn() !== "w") ||
      (playerColor === "b" && chess.turn() !== "b") ||
      playerColor === "spectator"
    ) {
      return false;
    }

    try {
      const result = chess.move(move);
      if (result) {
        setFen(chess.fen());
        
        const moveData = {
          ...move,
          piece: result.piece,
          color: result.color,
          san: result.san,
          captured: result.captured
        };
        
        setMoveHistory(prev => [...prev, moveData]);
        socket.emit("move", { gameId, move, playerColor });
        checkForCheck();
        return true;
      }
    } catch (error) {
      console.error("Error making move:", error);
    }
    return false;
  }, [chess, gameId, playerColor]);

  // Function to check for king in check and handle UI updates
  const checkForCheck = useCallback(() => {
    const inCheck = chess.inCheck();
    setKingInCheck(inCheck);

    if (inCheck) {
      let whiteKingSquare = null;
      let blackKingSquare = null;

      // Find king positions
      chess.board().forEach((row, rowIndex) => {
        row.forEach((square, colIndex) => {
          if (square && square.type === "k") {
            const file = "abcdefgh"[colIndex];
            const rank = 8 - rowIndex;
            const squareName = `${file}${rank}`;

            if (square.color === "w") {
              whiteKingSquare = squareName;
            } else {
              blackKingSquare = squareName;
            }
          }
        });
      });

      if (!whiteKingSquare || !blackKingSquare) {
        console.error("King position could not be determined");
        return;
      }

      const kingSquare = chess.turn() === "w" ? whiteKingSquare : blackKingSquare;
      setKingInCheckSquare(kingSquare);

      // Only play check sound when the current player's king is in check
      const kingCheckColor = chess.turn();
      if (playerColor === kingCheckColor) {
        // Play check sound only for the player whose king is in check
        checkAudioRef.current?.play()
          .catch(error => {
            // Audio play may be blocked, this is expected in some browsers
          });
      }
    } else {
      setKingInCheckSquare(null);
    }
  }, [chess, playerColor]);

  // Memoize chat-related handlers
  const sendMessage = useCallback(() => {
    if (message.trim()) {
      socket.emit("chatMessage", { gameId, user: username, text: message });
      setMessage("");
    }
  }, [message, gameId, username]);

  const handleKeyDown = useCallback((event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  }, [sendMessage]);

  const handleTyping = useCallback(() => {
    socket.emit("typing", username);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  }, [username]);

  // Handle square clicks for making moves
  const handleSquareClick = useCallback((square) => {
    const piece = chess.get(square);

    if (fromSquare === null) {
      if (piece && piece.color === playerColor) {
        setFromSquare(square);
      }
    } else {
      if (square === fromSquare) {
        setFromSquare(null);
      } else if (piece && piece.color === playerColor) {
        setFromSquare(square);
      } else {
        const move = { from: fromSquare, to: square, promotion: "q" };
        const moveSuccess = handleMove(move);
        if (moveSuccess) {
          setFromSquare(null);
        }
      }
    }
  }, [chess, fromSquare, handleMove, playerColor]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const getPlayerColorStyle = useCallback(() => {
    if (playerColor === "w") return { color: "#f8b400" };
    if (playerColor === "b") return { color: "#007bff" };
    if (playerColor === "spectator") return { color: "#28a745" };
    return {};
  }, [playerColor]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
      <Suspense fallback={<p>Loading game...</p>}>
        <SearchParamsComponent setGameId={setGameId} />
      </Suspense>
      <div style={{ position: "absolute", top: "10px", textAlign: "center" }}>
        <h2>Online Chess Game</h2>
        <p style={getPlayerColorStyle()}>Game ID: {gameId}</p>
        <p style={getPlayerColorStyle()}>
          You are: {playerColor === "spectator" ? username : playerColor === "w" ? "White" : "Black"}
        </p>
      </div>

      {gameOver ? (
        <div style={{ width: "400px", height: "400px", position: "relative" }}>
          <img
            src={
              gameOver.includes("White Wins!")
                ? "/images/white-wins.jpg"
                : gameOver.includes("Black Wins!")
                ? "/images/black-wins.jpg"
                : "/images/draw.jpg"
            }
            alt={gameOver}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "10px",
              objectFit: "cover",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "90vw", maxWidth: "1200px" }}>
          
          {/* Chessboard  */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "50vh",
              height: "50vh",
              position: "relative",
            }}
          >
            <Chessboard
              position={fen}
              onPieceDrop={(source, target) => handleMove({ from: source, to: target, promotion: "q" })}
              onSquareClick={handleSquareClick}
              boardOrientation={playerColor === "b" ? "black" : "white"}
              boardStyle={{ borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)" }}
              customDarkSquareStyle={{ backgroundColor: "#6594EB" }}
              customLightSquareStyle={{ backgroundColor: "#F3F6FA" }}
              showBoardNotation={true}
              showLegalMoves={true}
              customSquareStyles={{
                [kingInCheckSquare]: { backgroundColor: "rgba(255, 0, 0, 0.5)" },
                ...(fromSquare && { [fromSquare]: { backgroundColor: "rgba(255, 255, 0, 0.5)" } }),
              }}
              arePiecesDraggable={playerColor !== "spectator"}
              ariaLabel="Chess board"
            />
          </div>
          
          {/* Move History  */}
          <MoveHistory moveHistory={moveHistory} onMoveClick={handleMoveClick} />
        </div>
      )}

      {/* Chatbox */}
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          width: "250px",
          backgroundColor: "rgba(34, 34, 34, 0.9)", // Improved contrast
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        <h4 style={{ color: "white" }}>Chat</h4>
        <div style={{ maxHeight: "150px", overflowY: "auto", color: "white" }}>
          {messages.map((msg, i) => (
            <p
              key={i}
              style={{
                fontSize: "14px",
                color:
                  msg.user.includes("White") ? "#ed0c0c" :
                  msg.user.includes("Black") ? "#0cdeed" :
                  msg.user.includes("Spectator") ? "#35b51b" : "pink",
              }}
            >
              <strong>{msg.user}:</strong> {msg.text}
            </p>
          ))}
          {isTyping && <p style={{ color: "gray", fontSize: "12px" }}>{typingUser} is typing...</p>}
          <div ref={chatEndRef} />
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{ width: "100%", color: "black", backgroundColor: "white" }}
          aria-label="Chat message input"
        />
        <button
          onClick={sendMessage}
          style={{ width: "100%", marginTop: "5px", background: "#6594EB", color: "black", border: "none", padding: "5px" }}
          aria-label="Send message"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChessGame;