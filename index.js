const express = require('express')
const app = express();
const server = require("http").createServer(app);
const {MongoClient,ObjectID} = require('mongodb')
const cors = require("cors");
const userAuth = require('./userAuth')
const authorize = require('./authorize');
const res = require('express/lib/response');
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());
app.use(express.json())

const PORT = process.env.PORT || 9000;
const dbURL = process.env.DB_URL || 'mongodb://127.0.0.1:27017'
app.use("/auth",userAuth)

    

app.get("/",(req,res)=>{
    res.send("server running")
})

io.on("connection", (socket) => {
	socket.emit("me", socket.id);

	socket.on("disconnect", () => {
		socket.broadcast.emit("callEnded")
	});
 
	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		io.to(userToCall).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(data.to).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));