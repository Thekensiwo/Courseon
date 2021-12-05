const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const jwt = require('jsonwebtoken');
const fs = require('fs')
require('dotenv').config()
const https = require('https')
const {auth, getToken} = require('./functions.js')
const router = require('./Router.js')
const {User, Course} = require('./Database.js')

const options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}
const pkey = "LI252%3wxy7(9*aaaA321"


/* --- Middlewares --- */

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())
app.use(auth)
app.use(router)



/* --- Socket IO --- */

const server = https.createServer(options,app);
const { Server } = require("socket.io");
const io = new Server(server);

server.listen(process.env.PORT || 3000, () => {
  console.log('listening');
});


io.on('connection', async (socket) =>{

    /* --- Set up color for user's messages --- */
    const signs = "1234567890ABCDEF";
    let color = "";

    for(let i = 0; i < 6; i++){
        color += signs.charAt(Math.floor(Math.random() * signs.length))
    }

    /* --- Get user info --- */
    const token = getToken(socket.handshake.headers.cookie.split(";"))
    const userId = await jwt.verify(token, pkey).id
    const user = await User.findOne({ _id: userId })

    let user_ROOM_ID;
    let user_ID;

    // Get ROOM ID and userID of the socket
    socket.on('init-data', (room,id) =>{
        user_ROOM_ID = room;
        user_ID = id;
    })


    /* --- Join Room --- */

    socket.on('join-room', async (roomId, userIdPeer, userIDDB) =>{

        const course = await Course.findOne({_id: roomId});

        if(!course.activeUsers.includes(userIDDB)){
            const courseUpd = await Course.updateOne({_id: roomId}, {$push : {activeUsers: userIDDB}})
            const crs = await Course.findOne({_id: roomId})
            
            socket.join(roomId)
            io.to(roomId).emit('user-connected', userIdPeer, userIDDB, crs.activeUsers)
        }
        else{
            socket.join(roomId)
        }
    })


    /* --- Exit Room --- */

    socket.on('disconnect', async () => {

        const courseUpd = await Course.updateOne({_id: user_ROOM_ID}, {$pull : {activeUsers: user_ID}})
        
        socket.leave(user_ROOM_ID)
        io.to(user_ROOM_ID).emit('user-disconnected', user_ID)
    })


    /* --- New Message --- */

    socket.on('new-msg', async (roomId, msg, nick) => {

        io.to(roomId).emit('add-msg', msg, nick, color)

        const newMessage = {
            nick,
            msg,
            color: color
        }
        
        const course = await Course.updateOne({_id: roomId}, {$push : {chatMessages: newMessage}})
    })


    /* --- Stream started --- */
    socket.on('stream-started', (ROOM_ID) =>{
        socket.broadcast.to(ROOM_ID).emit("stream-start-info")
    })
})