const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => { 
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  socket.on('draw', (data) => {
    // Broadcast to all other clients
    socket.broadcast.emit('draw', data);
  });

  socket.on('clear', () => {
    io.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;   // Railway injects PORT
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
});
