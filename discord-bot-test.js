const Discord = require('discord.js');
const client = new Discord.Client();

require('dotenv').config();

client.once('ready', () => {
	console.log('準備完了！');
});


client.login(process.env.DiscordBotTest_token);
//iidesune2
