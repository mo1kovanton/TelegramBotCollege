require('dotenv').config();  
const { Bot , session } = require('grammy');
const {conversations } = require('@grammyjs/conversations');
const botCommands = require('./utilities/commandsLoader'); 
const botErrors = require('./utilities/errorHandler'); 

const bot = new Bot(process.env.BOT_TOKEN);  
bot.use(session({ initial: () => ({}) }));
bot.use(conversations());

botCommands(bot); 
bot.catch(botErrors); 

bot.start();
console.log('Проект запущен')
