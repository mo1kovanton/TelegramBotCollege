require('dotenv').config(); 
const {Bot} = require('grammy'); 

const BOT = new Bot(process.env.TELEGRAM_BOT_TOKEN); 

BOT.start(); 
