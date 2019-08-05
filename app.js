
var port = process.env.PORT || 8080;

var express = require('express');
var app = express();
var server = require('http').createServer(app).listen(port);
var io = require('socket.io').listen(server);
var fs = require('fs');

app.use('/', express.static(__dirname + '/public'));

var usernames = {};
var pairCount = 0;
var id = 0;
// game state
var gameState = 0;
var	varCounter = 0;
var scores = {};

console.log(`listen on ${port}`);
console.log("Connection Established !");

//Route
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	console.log("New Client Arrived!");

	socket.on('addUser', function (username) {
		socket.username = username;
		usernames[username] = username;
		scores[socket.username] = 0;
		varCounter = 0
		pairCount++;
		if (pairCount === 1 || pairCount >= 3) {
			id = Math.round((Math.random() * 1000000));
			socket.room = id;
			pairCount = 1;
			console.log(pairCount + " " + id);
			socket.join(id);
			gameState = 1;
		} if (pairCount === 2) {
			console.log(pairCount + " " + id);
			socket.join(id);
			gameState = 2;
		}

		console.log(username + " joined to " + id);

		socket.emit('updateInfos', 'SERVER', 'You are connected! <br> Waiting for other player to connect...', id);

		socket.broadcast.to(id).emit('updateInfos', 'SERVER', username + ' has joined to this game !', id);


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
