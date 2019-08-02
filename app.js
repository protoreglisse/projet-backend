const port = process.env.PORT || 7777;

const express = require('express');
const app = express();
const server = require('http').createServer(app).listen(port);
const io = require('socket.io').listen(server);
const fs = require('fs');
const bodyParser = require('body-parser');

// Avatar generator 
var jdenticon = require("jdenticon");
var size = 200;
var value = "icon value";
var png = jdenticon.toPng(value, size);
    
fs.writeFileSync("./testicon.png", png);

// Infos messages
console.log(`listen on ${port}`);
console.log("Connection Established !");

// Database
// Config
const mongoose = require('mongoose');
const dbURL = 'mongodb+srv://admin:admin@cluster0-pp4ha.mongodb.net/test?retryWrites=true&w=majority';

mongoose.connect(dbURL, {useNewUrlParser: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

// Mongoose schema 
var playerSchema = new mongoose.Schema({
	username: { type : String, match: /^[a-zA-Z0-9-_]+$/ },
	score: { type: Number, default: 0 }, 
	date: { type : Date, default : Date.now }, 
});

// Mongoose model 
var playerModel = mongoose.model('players', playerSchema);

app.use('/', express.static(__dirname + '/public'));

// Game variables
var usernames = {};
var playerCount = 0;
var id = 0;
var gameState = 0;
var varCounter = 0;
var scores = {};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Route
app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});







io.sockets.on('connection', function (socket) {
	console.log("New Client Arrived!");

	socket.on('addPlayer', function (username) {
		// socket.username = username;
		// usernames[username] = username;
		// console.log('dans le tableau il y a : ' + usernames[username]);
		// scores[socket.username] = 0;
		playerModel.find(null, function (err, users) {
			if (err) { throw err; }
			// comms est un tableau de hash
			console.log(users);
		  });
		var query = playerModel.find(null);
		query.where('username', username);
		query.limit(1);
		query.exec(function (err, users) {
			if (err) { throw err; }
			// On va parcourir le résultat et les afficher joliment
			var users;
			for (var i = 0, l = users.length; i < l; i++) {
			  user = users[i];
			  console.log('pseudo: ' + user.username );
			}
		  });
		var newPlayer = new playerModel({ username : username });
		newPlayer.save(function (err) {
			if (err) { throw err; }
			console.log('player ' + username + ' ajouté avec succès !');
		  });
		varCounter = 0
		playerCount++;

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
		socket.leave(socket.room);
	});
});