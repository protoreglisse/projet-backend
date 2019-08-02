const port = process.env.PORT || 8080;

const express = require('express');
const app = express();
const server = require('http').createServer(app).listen(port);
const io = require('socket.io').listen(server);
const fs = require('fs');

console.log(`listen on ${port}`);
console.log("Connection Established !");
// Database
// Config
const MongoClient = require('mongodb').MongoClient;
var db;

// Initialize connection once
MongoClient.connect("mongodb+srv://admin:admin@cluster0-pp4ha.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true }, function (err, database) {
	if (err) return console.error(err);
	db = database; 
});

app.use('/', express.static(__dirname + '/public'));

// Game variables
var usernames = {};
var playerCount = 0;
var id = 0;
var gameState = 0;
var varCounter = 0;
var scores = {};



//Route
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	console.log("New Client Arrived!");
	socket.username = username;
	usernames[username] = username;
	console.log('dans le tableau il y a : ' + usernames[username]);
	scores[socket.username] = 0;
	varCounter = 0
	socket.on('addPlayer', function (username) {
		db.users.count({
				username: usernames[username]
				
			})
			.then((count) => {
				if (count > 0) {
					console.log('Username exists.');
				} else {
					console.log('Username does not exist.');
					playerCount++;
				}
			});



		
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

		console.log(username + " joined to " + id);

		socket.emit('updatechat', 'SERVER', 'You are connected! <br> Waiting for other player to connect...', id);

		socket.broadcast.to(id).emit('updatechat', 'SERVER', username + ' has joined to this game !', id);


		if (gameState == 2) {
			fs.readFile(__dirname + "/lib/questions.json", "Utf-8", function (err, data) {
				jsoncontent = JSON.parse(data);
				io.sockets.in(id).emit('sendQuestions', jsoncontent);

			});
			console.log("Player2");
		} else {
			console.log("Player1");

		}





	});


	socket.on('result', function (user, result) {

		io.sockets.in(result).emit('viewResult', user);


	});




	socket.on('disconnect', function () {

		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		//io.sockets.in(id).emit('updatechat', 'SERVER', socket.username + ' has disconnected',id);
		socket.leave(socket.room);
	});
});