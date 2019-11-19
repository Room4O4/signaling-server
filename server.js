const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const server = require('http').createServer(app);
const io = require('socket.io')(server);

io.on('connection', socket => {
  socket.on('join', function(room, user) {
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom
      ? Object.keys(clientsInRoom.sockets).length
      : 0;

    if (numClients < 2) {
      // Client socket joins the room
      socket.join(room);

      // Send back 'joined' event to the client, with all clients currently in the room
      socket.emit(
        'joined',
        room,
        socket.id,
        clientsInRoom ? Object.keys(clientsInRoom.sockets) : null
      );

      // Send to every other client that a new roommate has joined.
      socket.to(room).emit('roommate', room, socket.id);
    } else {
      // max two clients. Send to the client that the room is full.
      socket.emit('full', room);
    }
  });

  socket.on('offer', (room, offer) => {
    // Send the offer to other clients in the room.
    // Currently a room can have only two peers.
    // Thus this emit would send the offer to the client other than the one who sent it.
    socket.to(room).emit('offer', offer);
  });

  socket.on('answer', (room, answer) => {
    // Send the offer to other clients in the room.
    // Currently a room can have only two peers.
    // Thus this emit would send the offer to the client other than the one who sent it.
    socket.to(room).emit('answer', answer);
  });

  socket.on('candidate', (room, candidate) => {
    // Send the candidate to all clients in the room except the sender.
    socket.to(room).emit('candidate', candidate);
  });
});
server.listen(PORT);
