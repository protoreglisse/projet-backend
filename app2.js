'use strict';

const port = process.env.PORT || 8080;

const express = require('express');
const app = express();
const server = require('http').createServer(app).listen(port); 
const fs = require('fs');

// Database
// Config
const mongoose = require('mongoose');
const dbURL = 'mongodb+srv://admin:admin@cluster0-pp4ha.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(dbURL, {
	useNewUrlParser: true
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	// we're connected!
});

// Mongoose schema 
var userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		match: /^[a-zA-Z0-9-_]+$/
	},
	score: {
		type: Number,
		default: 0
	},
	date: {
		type: Date,
		default: Date.now
	},
	avatar: {
		default: ''
	}
});

// Mongoose model 
var userModel = mongoose.model('users', userSchema);


//middlewares
app.use(express.static('public'));

//routes
app.get('/', (req, res) => {
	res.render('index');
});

//socket.io 
const io = require("socket.io")(server);

var users = {};
var id = 0; 
var playerCount = 0; 
var gameState = 0;


var questions = [
	{"question": "Punchline", "choices": ["RAP", "POÉSIE"], "correctAnswer":0},
	{"question": "Vers", "choices": ["RAP", "POÉSIE"], "correctAnswer":1},
	{"question": "Punchline", "choices": ["RAP", "POÉSIE"], "correctAnswer":0},
    {"question": "Vers", "choices": ["RAP", "POÉSIE"], "correctAnswer":1},
    {"question": "Punchline", "choices": ["RAP", "POÉSIE"], "correctAnswer":0},
    {"question": "Vers", "choices": ["RAP", "POÉSIE"], "correctAnswer":1},
    {"question": "Vers", "choices": ["RAP", "POÉSIE"], "correctAnswer":1}
]


//listen on every connection
io.on('connection', (socket) => {
	console.log('New user connected');

    // Define username
    socket.on('addUser', (data) => {
        var newUser = new userModel( {
            username: data.username
        } );
        newUser.save(function (err) {
            if (err) {
                socket.emit('userExists', {errorMessage: 'User already exists inside db'} )
            }
            console.log(`${newUser.username} added to db`);
            
        });

        playerCount++;

        socket.emit('updateInfos', 'SERVER', 'You are connected! <br> Waiting for other player to connect...', id);

        socket.broadcast.to(id).emit('updateInfos', 'SERVER', socket.username + ' has joined to this game !', id);

        if (playerCount === 1 || playerCount >= 3) {
            id = Math.round((Math.random() * 1000000));
            socket.room = id;
            playerCount = 1;
            console.log(playerCount + " " + id);
            socket.join(id);
            gameState = 1;
        }
        if (playerCount === 2) {
            console.log(playerCount + " " + id);
            socket.join(id);
            gameState = 2;
        }
    
        if (gameState == 2) {
            fs.readFile(__dirname + "/lib/questions.json", "Utf-8", function (err, data) {
                var jsoncontent = JSON.parse(data);
                io.sockets.in(id).emit('sendQuestions', jsoncontent);
    
            });
            // io.sockets.emit('sendQuestions', questions)
            console.log("Player2");
        } else {
            console.log("Player1");
    
        }


        socket.on('disconnect', function () {

            delete usernames[socket.username];
            io.sockets.emit('updateusers', usernames);
            //io.sockets.in(id).emit('updatechat', 'SERVER', socket.username + ' has disconnected',id);
            socket.leave(socket.room);
        });
    
    });

    
})