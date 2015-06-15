var container = $('.message-pane');
var messageQueue = [];
var messageCount;
var textarea = $('#message-textarea');
var submit = $('input[type="submit"]');
var myUser = $('.chat-heading div').text().replace('Chat: ', '');
var gameStopped = true;

var respones = {};

function Question() {

    var a = Math.floor(100 * Math.random());
    var b = Math.floor(100 * Math.random());

    this.text = a + " + " + b + " = ?";
    this.answer = a + b;
}

$('.message', container).addClass('read');

var leaderboard = {};

function postMessage(message) {
    textarea.val("BOT: " + message);
    submit.trigger('click');
}

function processMessage() {
    if(messageQueue.length == 0) 
        return;

    // Don't do anything if the streamer is writing
    if(textarea.val() != '')
        return;

    var message = messageQueue.shift();

    // If it's an info message
    if(message.hasClass('message-info')) {       
        var text = message.text();
        
        // Someone entered the room
        if(text.indexOf(' joined the room.') != -1) {
            var userJoined = text.slice(0, text.indexOf(' joined the room.'));
            postMessage("Hello " + userJoined + " welcome to my stream!");
        }     
    } else {
        var userName = $('a', message).text();

        // Check command
        var command = message.clone().children().remove().end().text();
        var parameter = '';
        // See if the command has a parameter
        if(command.indexOf(' ') != -1) { 
            command = command.split(' ');

            parameter = command[1];
            command = command[0];
        }
           
        switch(command) {
            case '!help':
                postMessage('Available commands are !time, !leaderboard, !ans, !repo');
            break;

            case '!time':
                postMessage('@' + userName + ', the time is: ' + (new Date()).toLocaleTimeString());
            break;

            case '!leaderboard':
                var s = "No one answered correctly yet!";
                var max = -1;
                for(var user in leaderboard) {
                    if(max == -1 || leaderboard[user] > leaderboard[max]) {
                        max = user;
                    }
                }

                if(max != -1) {
                    s = "The leader is " + max + " with a score of " + leaderboard[max];
                }

                postMessage(s);               
            break;

            case '!ans':

                if(typeof question === 'undefined') {
                    postMessage("There is no unanswered question!");
                    break;
                }

                var answer = '';
                try {
                    answer = parseInt(parameter);
                } catch(err) {}

                if(answer == question.answer) {
                    if(leaderboard[userName] == undefined) {
                        leaderboard[userName] = 1;
                    } else {
                        leaderboard[userName]++;
                    }

                    postMessage('Congratulations ' + userName + '.' + answer + ' was the correct answer to ' + question.text);
                    question = undefined;
                }
            break;

            case '!repo':
                var repoName = respones.repo !== undefined ? respones.repo : 'not set :(';
                postMessage('@' + userName + ', the current repository is: ' + repoName);
            break;

            // Admin only commands
            case '!game':
                // Check if admin (bot has been started by the current user)
                if(userName != myUser) break;

                if(parameter == 'start') {
                    gameStopped = false;
                    postMessage('Admin has started the game! :)');
                    askQuestion();
                }
                else if(parameter == 'stop') {
                    postMessage('Admin has stopped the game! :(');
                    gameStopped = true;
                }
            break;

            case '!set-repo':
                if(userName != myUser) break;
                
                if(parameter != '') {
                    respones.repo = 'http://' + parameter;
                    postMessage('Repository set to ' + respones.repo);
                }
            break;
        }
    }
}

function processMessages() {
    // Get new messages since last check
    var newMessages = $('.message:not(.read)', container);

    newMessages.each(function() {
        // Mark message as read
        $(this).addClass('read');

        // Add new messages to the queue
        messageQueue.push($(this));
    });
}

var question;
function askQuestion() {
    if(gameStopped)
        return;

    if(question != undefined) {
        postMessage("The answer to the question " + question.text + " was " + question.answer);
    }

    question = new Question();
    postMessage(question.text + " Type !ans 123 to answer...");

    // Ask a question every 80 seconds
    setTimeout(askQuestion, 80000);
}

function tick() {
    processMessages();
    processMessage();

    setTimeout(tick, 300);
}

tick();

