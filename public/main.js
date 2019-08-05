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



    //new user
    validate.click(function () {
        var username = inputUser.val()
        socket.emit('addUser', username);
        users[socket.username] = socket.username;
        myScore.text(users[socket.username]);
    });

    socket.on('updateInfos', function (username, questions, id) {
        login.hide();
        loader.show();
        otherScore.text(username);
    });


    // socket.on('sendQuestions', function (data) {
    //     loader.hide();
    //     rules.show();
    //     var gameTransition = window.setTimeout(function () {
    //         rules.hide();
    //     }, 3000);

    //     var game = function (data, counter) {
    //         window.clearTimeout(gameTransition);
    //         rules.hide();
    //         quiz.show();
    //         question.text(data.questions[counter].question);
    //         btn1.attr('value', 0).text(data.questions[counter].choices[0]).click(function () {
    //             btn1.attr('disabled', true);
    //             btn2.attr('disabled', true);
    //             givenAnswer = 0;
    //             correctAnswer = data.questions[counter].correctAnswer;
    //             if (givenAnswer == correctAnswer) {
    //                 myQuizScore++;
    //                 myScore.html('<br>' + myQuizScore);
    //                 counter++;
    //             } else {
    //                 counter++;
    //             }

    //         });
    //         btn2.attr('value', 1).text(data.questions[counter].choices[1]).click(function () {
    //             btn1.attr('disabled', true);
    //             btn2.attr('disabled', true);
    //             givenAnswer = 1;
    //             correctAnswer = data.questions[counter].correctAnswer;
    //             if (givenAnswer == correctAnswer) {
    //                 myQuizScore++;
    //                 myScore.html('<br>' + myQuizScore);
    //                 counter++;
    //             } else {
    //                 counter++;
    //             }

    //         });


    //     };

    // var duel = function (counter) {
    //     while (counter < 5) {
    //         game(data);
    //         counter++;
    //     };
    // };


    // duel(j);

    // var duel = window.setInterval(function (j) {
    //     btn1.attr('disabled', false);
    //     btn2.attr('disabled', false);
    //     game(data, i);
    //     j++;
    // }, 4000);

    // if(j == 5) {
    //     clearInterval(duel);
    //     endGame = true;
    // }

    // if (endGame) {
    //     socket.emit('results', function (user) {
    //         if (user == username) {
    //             myscore += 10;
    //             alert('Player 1 score : ' + myQuizScore);
    //         } else {
    //             otherscore += 10;
    //             alert('Player 2 score : ' + otherQuizScore);
    //         }

    //         if (myQuizScore > otherQuizScore) {
    //             alert('Tu as gagné !');
    //         } else if (myQuizScore < otherQuizScore) {
    //             alert('Tu as perdu...');
    //         } else {
    //             alert('Égalité ! Pas de jaloux...');
    //         }
    //     });
    // }


    // socket.emit('result', { myScore: myQuizScore })

    socket.on('disconnect', function () {
        alert('Votre adversaire à fui!');
    })



    // });



    // DRAFT

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
            loader.show();
            if (i < 4) {
                j = 0;
                j++;
                question.text(data.questions[i].question);
                btn1.attr('value', 0).text(data.questions[i].choices[0]);
                btn2.attr('value', 1).text(data.questions[i].choices[1]);
                //timer
                // $(document).ready(function () {
                //     var counter = 0;
                //     var c = 1;
                // var k = setInterval(function () {
                //     $(".loading-page .counter h3").html(c + "sec");
                //     $(".loading-page .counter hr").css("width", (c * 10) + "%");
                //     counter++;
                //     c++;
                //     if (counter == 10) {
                //         clearInterval(k);
                //     }
                // }, 1000);
                // });
                //timer
                $("#answers button").attr('disabled', false);
                $("#answers button").click(function () {
                    $("#answers button").attr('disabled', true);
                    var givenAns = this.value;
                    var correctAns = data.questions[i - 1].correctAnswer;
                    var response = (givenAns == correctAns);
                    if (response) {
                        if (j == 1) {
                            socket.emit('result', username, user_id);
                            console.log("correct ans");
                            console.log(username);
                            console.log("value of inner j: " + j)
                            $('#goodAns').show().delay(800).hide();
                            j++;
                        }
                    } else {
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
                quiz.show();
                loader.hide();
                $("#finalresult_show").show();
            }
        }, 10000);
    });

});