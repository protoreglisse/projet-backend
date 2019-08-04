'use strict';
$(function () {
    var socket = io.connect();

    // "PARTIALS"
    var hud = $('#hud');
    var myScore = $('#myscore');
    var otherScore = $('#otherscore');
    var login = $('#login');
    var validate = $('#validate');
    var inputUser = $('#input_user');
    var loader = $('#load');
    var rules = $('#rules');
    var quiz = $('#quiz');
    var question = $('#question h2');
    var displayQuestion = $('#displayQuestion');
    var btn1 = $('#answer1');
    var btn2 = $('#answer2');


    // Global variables
    var users = {};
    var id = 0;
    var myQuizScore = 0;
    var otherQuizScore = 0;
    var gameStart = false;
    var quizgame;
    var i = 0;

    // If user already exists in db : ERROR
    socket.on('userExists', function () {
        alert('Ce pseudonyme est déjà utilisé, choisis en un autre!');
        login.show();
    });

    //new user
    validate.click(function () {
        socket.emit('addUser', {
            username: inputUser.val()
        });
        socket.username = inputUser.val();
        users[socket.username] = socket.username;
        myScore.text(users[socket.username]);
    });

    socket.on('updateInfos', function (username, questions, id) {
        login.hide();
        loader.show();
        otherScore.text(username);
    });


    socket.on('sendQuestions', function (data) {
        loader.hide();
        rules.show();
        var gameTransition = window.setTimeout(function () {
            rules.hide();
            gameStart = true;
            console.log(gameStart);
        }, 5000);

        var game = function (data) {
            var givenAnswer;
            window.clearTimeout(gameTransition);
            rules.hide();
            quiz.show();
            question.text(data.questions[i].question);
            btn1.attr('value', 0).text(data.questions[i].choices[0]).click(function () {
                btn1.attr('disabled', true);
                btn2.attr('disabled', true);
                givenAnswer = 0;
            });
            btn2.attr('value', 1).text(data.questions[i].choices[1]).click(function () {
                btn1.attr('disabled', true);
                btn2.attr('disabled', true);
                givenAnswer = 1;
            });
            var correctAnswer = data.questions[i].correctAnswer;
            if (givenAnswer == correctAnswer) {
                myQuizScore += 10;
                myScore.append('<br>' + myQuizScore);
            }
            if (i <= 4) {
                i++;
            }

        };



        window.setInterval(function () {
            btn1.attr('disabled', false);
            btn2.attr('disabled', false);
            game(data);
        }, 5000);


        socket.on('results', function (user) {
            if (user == username) {
                myscore += 10;
                alert('Player 1 score : ' + myQuizScore);
            } else {
                otherscore += 10;
                alert('Player 2 score : ' + otherQuizScore);
            }

            if (myQuizScore > otherQuizScore) {
                alert('Tu as gagné !');
            } else if (myQuizScore < otherQuizScore) {
                alert('Tu as perdu...');
            } else {
                alert('Égalité ! Pas de jaloux...');
            }
        });
        // socket.emit('result', { myScore: myQuizScore })



    });

});