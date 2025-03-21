const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Chess } = require("chess.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const games = {}; // Store active games

app.use(cors());

io.on("connection", (socket) => {
  console.log("New player connected:", socket.id);

  socket.on("joinGame", (gameId) => {
    if (!games[gameId]) {
      games[gameId] = {
        chess: new Chess(),
        players: { white: null, black: null },
        moves: []
      };
    }

    const game = games[gameId];

    // Assign player colors
    if (!game.players.white) {
      game.players.white = socket.id;
      socket.emit("playerColor", "w");
    } else if (!game.players.black) {
      game.players.black = socket.id;
      socket.emit("playerColor", "b");
    } else {
      socket.emit("spectator");
    }

    socket.join(gameId);
    socket.emit("gameState", game.chess.fen());
    
    // Send move history to new players
    if (game.moves && game.moves.length > 0) {
      game.moves.forEach(moveData => {
        socket.emit("moveMade", moveData);
      });
    }
  });

  socket.on("move", ({ gameId, move, playerColor }) => {
    const game = games[gameId];
    if (!game) return;
    
    const { chess, players } = game;
    
    if (
      (playerColor === "w" && socket.id !== players.white) ||
      (playerColor === "b" && socket.id !== players.black)
    ) {
      return;
    }
    
    try {
      // Make the move using chess.js
      const result = chess.move(move);
      
      if (result) {
        // Determine if the move puts the opponent in check or checkmate
        const isInCheck = chess.inCheck();
        const isCheckmate = chess.isCheckmate();
        
        // Add appropriate notation to the SAN
        let san = result.san;
        if (isCheckmate && !san.includes('#')) {
          san = san + '#';
        } else if (isInCheck && !san.includes('+')) {
          san = san + '+';
        }
        
        // Store move with additional information including SAN notation
        const moveData = {
          ...move,
          piece: result.piece,
          color: result.color,
          san: san, // Standard Algebraic Notation with check/checkmate indicators
          captured: result.captured,
          check: isInCheck,
          checkmate: isCheckmate
        };
        
        // Add move to history
        if (!game.moves) game.moves = [];
        game.moves.push(moveData);
        
        // Broadcast game state and move information
        io.to(gameId).emit("gameState", chess.fen());
        io.to(gameId).emit("moveMade", moveData);
        
        if (isCheckmate) {
          io.to(gameId).emit("gameOver", { winner: playerColor });
        } else if (chess.isDraw()) {
          io.to(gameId).emit("gameOver", { winner: "draw" });
        }
      }
    } catch (error) {
      console.error("Error processing move:", error);
    }
  });

  socket.on("chatMessage", ({ gameId, user, text }) => {
    io.to(gameId).emit("chatMessage", { user, text });
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    
    // Find and handle games where this player was participating
    Object.keys(games).forEach(gameId => {
      const game = games[gameId];
      if (game.players.white === socket.id) {
        console.log(`White player left game ${gameId}`);
        // You could handle white player disconnection here
        // For example, notify other players, mark the position as abandoned, etc.
      } else if (game.players.black === socket.id) {
        console.log(`Black player left game ${gameId}`);
        // You could handle black player disconnection here
      }
      
      // Optional: Clean up games with no active players after some time
    });
  });
});

server.listen(5001, () => console.log("Server running on port 5001"));