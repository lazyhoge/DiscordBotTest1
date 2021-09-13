//configを読み込む
const config = require('./config.json');

// Discord.jsモジュールを読み込む
const Discord = require('discord.js');

// 新しいDiscordクライアントを作成
const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS]});

//機密情報の書かれた.envを読み込む
require('dotenv').config();

// クライアントの準備ができた際に実行されます
// このイベントはログインした後に１度だけ実行します
client.once('ready', () => {
	console.log('準備完了！');
});

//メッセージを待ち受ける
client.on('message', message => {
	console.log(message.content);
});

//メッセージを送信
if (message.content === '!ping') {
	// メッセージが送信されたチャンネルへ「Pong.」を送り返す。
	message.channel.send('Pong.');
}

// トークンを使ってDiscordにログイン
client.login(prossess.env.DiscordBotTest_token);