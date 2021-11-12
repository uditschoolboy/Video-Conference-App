const express = require('express');
const app = express();

//Make Http server with app variable
const server = require('http').Server(app);

//Set up socket.io
const io = require('socket.io')(server);

//Set view engine to ejs
app.set('view engine', 'ejs');

//Set public folder for serving static assets
app.use(express.static('public'));

//Set up a route for video call with the given name
app.get('/:room', (req, res) => {
    const room = req.params.room;
    console.log("Route " , room);
    //Render room.ejs to the client. It will be blank for start.
    //The javascript at the client end will be loading the video elements with video of peers in that room
    res.render('room', {roomId: room});
});

//When someone connects to this server
io.on('connection', socket => {
    //When someone joins a room
    socket.on('join-room', (roomId, userId) => {
        //Join the room and inform other in the room about the new connection
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);

        //When a user disconnects remove their video
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
        })
    });
});


//Set up the server on port 3000
server.listen(3000, () => {
    console.log("Start hogaya");
})