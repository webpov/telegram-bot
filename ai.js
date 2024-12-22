const fetch = require('node-fetch');

const AI_AGENT_TITLE = "virtual assistant, trading advice agent";
const baseParsedPrompt = `You are a ${AI_AGENT_TITLE}, give a single 2 sentence  response. 
dont include any introductions, just respond to the following prompt from the client: `;
const randomMessagePrompt = `
  Act as a ${AI_AGENT_TITLE}, give a single 2 sentence random very specific investing/trading advice
  dont include any introductions, just return the advice
`
const WHITELISTED_USERS = ['webqubbot', 'webqubbot_bot', 'webqubdev'];

const handleAiCommand = async (ctx) => {
  const prompt = ctx.message.text.replace('/ai', '');
  
  if (ctx.message.chat.type === 'supergroup') {
    if (!WHITELISTED_USERS.includes(ctx.message.from.username)) {
      return ctx.reply("You dont have access to use this command in this group. \n Try again in a private chat.", {
        reply_markup: {
          inline_keyboard: [
            [ { text: 'Click here to go to private chat', url: `https://t.me/webqubbot` } ]
          ]
        }
      });
    } else {
      ctx.reply("Requesting...");
      const parsedPrompt = `${baseParsedPrompt} ${prompt}`;
      const aiResponse = await aiComplete(parsedPrompt, 'groq');
      return ctx.reply(aiResponse);
    }
  }
  
  ctx.reply("Requesting...");
  const parsedPrompt = `${baseParsedPrompt} ${prompt}`;
  const aiResponse = await aiComplete(parsedPrompt, 'groq');
  return ctx.reply(aiResponse);
};

async function aiComplete(prompt, provider = 'openai') {
  const endpoints = {
    openai: 'https://api.openai.com/v1/chat/completions',
    groq: 'https://api.groq.com/openai/v1/chat/completions'
  };

  const apiKeys = {
    openai: process.env.OPENAI_API_KEY,
    groq: process.env.GROQ_API_KEY
  };

  const models = {
    openai: 'gpt-4',
    groq: 'llama3-8b-8192'  
  };

  const endpoint = endpoints[provider];
  const apiKey = apiKeys[provider];
  const model = models[provider];

  if (!endpoint || !apiKey) {
    throw new Error(`Invalid or unconfigured provider: ${provider}`);
  }
    console.table({
    endpoint,
    apiKey,
    model
    })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{
        role: "system", 
        content: `${prompt}`
      }],
      max_tokens: 256,
    }),
  });

  if (provider === 'openai') {
    const data = await response.json();
    return data.choices[0].message.content;
  } else if (provider === 'groq') {
    const data = await response.json();
    console.log("response", data)
    return data.choices[0].message.content;
  } else {
    return JSON.stringify(await response.json());
  }
}

const handleStart = (ctx) => {
  return ctx.reply('Welcome to the Corina Coin Bot! Use /help to see the available commands.',
    {
      reply_markup: {
        inline_keyboard: [ [ { text: 'Open Webqub', web_app: { url: "https://www.webqub.com/" } } ] ]
      }
    }
  );
};

module.exports = {
  aiComplete,
  AI_AGENT_TITLE,
  baseParsedPrompt,
  randomMessagePrompt,
  handleAiCommand,
  handleStart
}; 