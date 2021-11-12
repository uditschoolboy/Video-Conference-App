const socket = io('/');
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
});

//This will hash UserId of peers to their call variables
const peers = {};

//Get reference to video grid and create video element for this client
const videoGrid = document.getElementById('videoGrid');
const myVideo = document.createElement('video');
myVideo.muted = true;
//Get the stream of video and add that stream to the video element
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);
    
    //Receive calls from other users
    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        })
    })

    //When a new user joins the room connects then send this stream to that new user
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream);
    });    
})

//When the client connection to peer server opens
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id);
});

//When a user disconnects
socket.on('user-disconnected', userId => {
    if(peers[userId]) peers[userId].close();
});


//function to add videoElement to grid
function addVideoStream(video, stream) {
    //Set the stream as the source object of the video element
    video.srcObject = stream;
    //Attaching this listener. When video loads play it
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    //Append the video to the video-grid
    videoGrid.append(video);
}

//function to send the stream to the a user: This function will make call to a user
function connectToNewUser(userId, stream) {
    //call function will call a user and send it the stream
    const call = myPeer.call(userId, stream);

    //When the other users send you their video stream then attach that stream to a video element and add the element to the grid.
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    });
    //When disconnected remove their video
    call.on('close', () => {
        video.remove();
    });
    peers[userId] = call;
}