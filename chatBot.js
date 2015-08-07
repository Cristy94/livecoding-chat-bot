var container = $('.message-pane');
var messageQueue = [];
var messageCount;
var textarea = $('#message-textarea');
var submit = $('input[type="submit"]');
var myUser = $('.chat-heading div').text().replace('Chat: ', '').toUpperCase();
var gameStopped = true;
var botWritingCount = 0;

// Initiale the color pallete
$('#username-color').trigger('click');
$('#context-menu').trigger('mouseout');

var initialColor = $('#colorPremiumInput').val();

function Question() {

    var a = Math.floor(100 * Math.random());
    var b = Math.floor(100 * Math.random());

    this.text = a + " + " + b + " = ?";
    this.answer = a + b;
}

$('.message', container).addClass('read');

var responses = {};
try {
    responses = JSON.parse(localStorage.responses);
}
catch (e) {
    // Ignore
}
var leaderboard = {};

function postMessage(message) {
    botWritingCount++;

    // Make name white
    $('.user-color-item').eq(0).attr('data-color', '#FFFFFF').trigger('click');
    setTimeout(function(){    
        textarea.val("BOT: " + message);
        submit.trigger('click');

        // Restore name color
        botWritingCount--;
        if(botWritingCount == 0) {
            setTimeout(function() {
                // Only change back the color if no message is being written
                if(botWritingCount == 0)
                $('.user-color-item').eq(0).attr('data-color', initialColor).trigger('click');
            }, 300);
        }
    }, 500);
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
        // var userName = $('a', message).text(); <- That includes all links in a message.
        var userName = $('.nickname', message).text(); // There's a class for names!

        var regexp = new RegExp("^"+userName, "g");

        // Check command
        var command = message.text().replace(regexp, '');
        var commandSetKey = undefined;
        var parameter = '';
        // See if the command has a parameter
        if(command.indexOf(' ') != -1) { 
            commands = command.split(' ');
            
            command = commands.shift();
            parameter = commands.join(' ');
            
            if (command.startsWith('!set-')) {
                setCommands = command.split('-');
                
                command = setCommands.shift();
                commandSetKey = setCommands.join('-');
            }
        }
           
        switch(command) {
            case '!help':
                var availableCommands = getBaseCommands().concat(getCustomCommands());
                if(isAdmin(userName)) {
                    availableCommands = availableCommands.concat(getAdminCommands());
                }
                postMessage('Available commands are : ' + availableCommands.join(', '));
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

                    postMessage('Congratulations ' + userName + '. The correct answer was' + answer);
                    question = undefined;
                }
            break;
            
            // Admin only commands
            case '!game':
                // Check if admin (bot has been started by the current user)
                if(!isAdmin(userName)) break;

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

            case '!set':
                if(!isAdmin(userName)) break;
                
                if (getBaseCommands().concat(getAdminCommands()).indexOf('!'+commandSetKey) > -1) {
                    postMessage('Command ' + commandSetKey + ' is reserved !');
                    break;
                }
                
                if(commandSetKey != undefined && parameter != '') {
                    responses[commandSetKey] = parameter;
                    postMessage('Command ' + commandSetKey + ' set to ' + responses[commandSetKey]);
                    
                    localStorage.responses = JSON.stringify(responses);
                }
            break;

            case '!reset':
                if(!isAdmin(userName)) break;
                
                responses = {};
                localStorage.responses = undefined;
                postMessage('Bot has been reset! :-s');
            break;
            
            default:
                var key = command.replace('!', '');
                if (responses[key] != undefined) {
                    postMessage('@' + userName + ', ' + key + ' is : ' + responses[key]);
                }
            break;
        }
    }
}

function isAdmin(userName) {
    return userName.toUpperCase() == myUser;
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

function getBaseCommands() {
    return ['!help', '!time', '!leaderboard', '!ans'];
}

function getAdminCommands() {
    return ['!set', '!reset', '!game'];
}

function getCustomCommands() {
    commands = [];
    for (customKey in responses) {
        commands.push('!' + customKey);
    }
    return commands;
}

var question;
function askQuestion() {
    if(gameStopped)
        return;

    if(question != undefined) {
        postMessage("The answer to the question " + question.text + " was " + question.answer);
    }

    question = new Question();
    postMessage(question.text + " Type !ans {number} to answer...");

    // Ask a question every 80 seconds
    setTimeout(askQuestion, 80000);
}

function tick() {
    processMessages();
    processMessage();

    setTimeout(tick, 300);
}

tick();
