const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/userRoute");
const messageRoute = require("./routes/messageRoute");
const socket = require("socket.io");


const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use("/api/auth", userRoute);
app.use("/api/messages", messageRoute);

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("Connected to Database.");
}).catch((err)=>console.log(err.message));

const server = app.listen(process.env.PORT, ()=>{
    console.log(`The app has started on port ${process.env.PORT}`);
});

const io = socket(server, {
    cors: {
        origin: process.env.REACT_URL
    }
});

global.onlineUsers = new Map();

io.on("connection", (socket)=>{
    global.chatSocket = socket;
    socket.on("add-user", (userId)=>{
        onlineUsers.set(userId, socket.id);
    });
    socket.on("send-msg", (data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-receive", data.message);
        }
    });
});

app.get("/", (req, res)=>{
    res.json("Hello World")
})