'use strict';
$(function () {
    var socket = io.connect();

    // "PARTIALS"
    var hud = $('#hud');
    var me = $('#player1');
    var otherOne = $('#player2');
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
    var errorMsg = $('#error');

    // Global variables
    var users = {};
    var id = 0;
    var myQuizScore = 0;
    var otherQuizScore = 0;
    var endGame = false;
    var quizgame;
    var i = 0;
    var j = 0;
    var correctAnswer;
    var givenAnswer;
    var userId = 0;


    //new user
    validate.click(function () {
        var username = inputUser.val()
        var score = myQuizScore;
        socket.emit('addUser', username, score);
        users[socket.username] = socket.username;
    });

    socket.on('updateInfos', function (usernames, questions, id) {
        login.hide();
        loader.show();
        // alert(usernames);
        $('#myName').text(usernames[0]);
        $('#otherName').text((usernames[1]));
        userId = id;
    });


    socket.on('disconnect', function () {
        alert('Votre adversaire à fui!');
    })


    function transition() {
        rules.show();
    }

    socket.on('sendQuestions', function (data) {
        loader.hide();
        transition();
        i = 0;
        var timer = setInterval(function () {
            rules.hide();
            quiz.show();
            // loader.show();
            if (i < 4) {
                j = 0;
                j++;
                question.text(data.questions[i].question);
                btn1.attr('value', 0).text(data.questions[i].choices[0]);
                btn2.attr('value', 1).text(data.questions[i].choices[1]);
                //displayed timer
                $(document).ready(function () {
                    var counter = 0;
                    var c = 1;
                    $(".loading-page").show();
                var k = setInterval(function () {
                    $(".loading-page .counter h3").html(c + "sec");
                    $(".loading-page .counter hr").css("width", (c * 10) + "%");
                    counter++;
                    c++;
                    if (counter == 10) {
                        clearInterval(k);
                    }
                }, 1000);
                });
                //timer
                $("#answers button").attr('disabled', false);
                $("#answers button").click(function () {
                    $("#answers button").attr('disabled', true);
                    var givenAns = this.value;
                    console.log('given ans = ' + givenAns)
                    var correctAns = data.questions[i - 1].correctAnswer;
                    if (givenAns == correctAns) {
                        myQuizScore += 10;
                        myScore.append(myQuizScore);
                        if (j == 1) {
                            socket.emit('result', username, userId, scores);
                            console.log("correct ans");
                            console.log(username);
                            console.log("value of inner j: " + j)
                            $('#goodAns').show().delay(800).hide();
                            j++;
                        }
                    } else {
                        myScore.text(myQuizScore);
                        if (j == 1) {
                            $('#badAns').show().delay(800).hide();
                            j++;
                        }
                    }
                });
            }
            i++;
            if (i == 5) {
                clearInterval(timer);
                // quiz.show();
                // loader.hide();
                socket.emit('result', myQuizScore)
                // faire div finalResult
                $("#finalResult").show();
            }
        }, 10000);
    });


    socket.on('viewResult', function (user) {
        if (user == username) {
            
        } else {
            otherscore += 10;
            otherScore.append('<br>' + otherQuizScore);
        }
        if (myscore > otherscore) {
            alert("You Win!");
        } else if (myscore < otherscore) {
            alert("You Lose..");
        } else {
            alert("Tie!");
        }
    });


});