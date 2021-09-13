// Discord.jsモジュールを読み込む
const { Client, Intents } = require('discord.js');
// 新しいDiscordクライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

require('dotenv').config();

// クライアントの準備ができた際に実行されます
// このイベントはログインした後に１度だけ実行します
client.once('ready', () => {
	console.log('準備完了！');
});

// トークンを使ってDiscordにログイン
client.login(process.env.DiscordBotTest_token);