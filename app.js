require('dotenv').config()
const cron = require("node-cron");
const express = require('express')
const { Telegraf } = require('telegraf');
const { aiComplete, randomMessagePrompt, handleAiCommand, handleStart } = require('./ai');

const bot = new Telegraf(process.env.BOT_TOKEN);

cron.schedule(
  '30 * * * *', 
  async function() {
    const randomMessage = await aiComplete(randomMessagePrompt, 'groq')
    const separatedMessage = randomMessage.split('.').join('\n')  
    bot.telegram.sendMessage(process.env.TELEGRAM_CHANNEL_ID,
      "💡 Advice 💡" +"\n\n"+separatedMessage
    )
  }
)

bot.start(handleStart);

const tgbotHelp = (ctx) => {
  return ctx.reply(`
    Available commands:
    /ai - Ask anything
  `)
}
bot.help(tgbotHelp);
bot.command('help', tgbotHelp);
bot.command('ai', handleAiCommand);

bot.launch();
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const app = express()
app.use(express.static('client'))

const PORT = process.env.PORT || 3009
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`))
