# NOTE: THIS BOT WAS CREATED BEFORE LIVECODING IMPLEMENTED THEIR API. THIS IS NOT MAINTAINED. THIS MIGHT NOT WORK ANYMORE, THE CODE IS OLD!

# livecoding-chat-bot
Basic chat bot for LiveCoding.tv

# How to use
* First you have to open the chat in a new window, you can do that by accessing https://www.livecoding.tv/chat/username/, where `username` is your, well, username...
* Now open the JavaScript console (CTRL+SHIFT+I on Chrome) and paste the entire code from `chatBot.js` file into the it and press eter.
* The bot should now work as long as you keep the page opened.

# Features
### Admin commands
* You, as the bot runner, can write `!game start` or `!game stop` to start or stop a simple trivia game included.
* You can set any command as `key->value`. Example, setting the `repo` key:   
```
!set-repo https://github.com/Cristy94/livecoding-chat-bot   
!repo
```
### General commands and features
* The bot will welcome people.
* `!leaderboard` to see the current leader of the game.
* `!time` will respond with the current time in the streamer's timezone.
* The bot will never interrupt you when writing.
