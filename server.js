const http = require('http');
const { Server } = require('socket.io');

const PORT = 4000;
const ADMIN_SECRET = process.env.SOCKET_ADMIN_SECRET || "admin-secret-key";

const httpServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Socket.IO Server Running');
});

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now (adjust for production)
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle joining rooms
  socket.on('join', (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room: ${room}`);
  });

  // Handle leaving rooms
  socket.on('leave', (room) => {
    socket.leave(room);
    console.log(`Socket ${socket.id} left room: ${room}`);
  });

  // Handle admin broadcast (triggered by backend)
  socket.on('backend:trigger', (data) => {
    const { secret, room, event, payload } = data;
    
    if (secret !== ADMIN_SECRET) {
      console.log(`Unauthorized trigger attempt from ${socket.id}`);
      return;
    }

    if (room) {
      io.to(room).emit(event, payload);
      console.log(`Broadcast to [${room}]: ${event}`);
    } else {
      io.emit(event, payload);
      console.log(`Broadcast to all: ${event}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`> Socket.IO server running on port ${PORT}`);
});
