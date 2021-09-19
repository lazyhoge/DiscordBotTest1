// Discord.jsモジュールを読み込む
const Sequelize = require('sequelize');
const EloRating = require('elo-rating');
const { Client, Intents } = require('discord.js');
require('dotenv').config();

// 新しいDiscordクライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//sequelizeの設定
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// SQLite only
	storage: 'database.sqlite',
});
/*
 * equivalent to: CREATE TABLE tags(
 * discordID VARCHAR(255),
 * VRChatID VARCHAR(255),
 * rating INT NOT NULL DEFAULT 1500
 * );
 */
const Tags = sequelize.define('tags', {
	discordID: {
		type: Sequelize.STRING,
		unique: true,
	},
	VRChatID: Sequelize.STRING,
	rating: {
		type: Sequelize.INTEGER,
		defaultValue: 1500,
		allowNull: false,
	},
});


// クライアントの準備ができた際に実行されます
// このイベントはログインした後に１度だけ実行します
client.once('ready', () => {
	console.log('準備完了！');
	Tags.sync({ force: true }); //←テストのとき毎回まっさらにするので引数入れてる。
});

//!pingというメッセージにpongを返す
client.on('message', message => {
	if (message.content === '!ping') {
		message.channel.send('Pong.');
	}
});

//データいじいじ
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'addtag') {
		const tagDiscordID = interaction.options.getString('discordID');
		const tagVRchatID = interaction.options.getString('VRchatID');

		try {
			// equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
			const tag = await Tags.create({
				discordID: tagDiscordID,
				VRchatID: tagVRchatID,
			});
			return interaction.reply(`Tag ${tag.discordID} added.`);
		}
		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.reply('That tag already exists.');
			}
			return interaction.reply('Something went wrong with adding a tag.');
		}
	} else if (commandName === 'tag') {
		const tagDiscordID = interaction.options.getString('discordID');

		// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
		const tag = await Tags.findOne({ where: { discordID: tagDiscordID } });
		if (tag) {
			return interaction.reply(tag.get('VRChatID'));
		}
		return interaction.reply(`Could not find tag: ${tagDiscordID}`);

	} else if (commandName === 'edittag') {
		const tagDiscordID = interaction.options.getString('discordID');
		const tagVRchatID = interaction.options.getString('VRChatID');

		// equivalent to: UPDATE tags (description) values (?) WHERE name='?';
		const affectedRows = await Tags.update({ VRchatID: tagVRchatID }, { where: { discordID: tagdiscordID } });
		if (affectedRows > 0) {
			return interaction.reply(`Tag ${tagDiscordID} was edited.`);
		}
		return interaction.reply(`Could not find a tag with name ${tagDiscordID}.`);

	} else if (commandName === 'taginfo') {
		const tagDiscordID = interaction.options.getString('discordID');

		// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
		const tag = await Tags.findOne({ where: { name: tagDiscordID } });
		if (tag) {
			return interaction.reply(`${tagDiscordID} was created by ${tag.username} at ${tag.createdAt} and his rating is ${tag.raitng} .`);
		}
		return interaction.reply(`Could not find tag: ${tagDiscordID}`);

	} else if (commandName === 'showtags') {
		// equivalent to: SELECT name FROM tags;
		const tagList = await Tags.findAll({ attributes: ['discordID'] });
		const tagString = tagList.map(t => t.discordID).join(', ') || 'No tags set.';
		return interaction.reply(`List of tags: ${tagString}`);

	} else if (commandName === 'removetag') {
		const tagDiscordID = interaction.options.getString('discordID');

		// equivalent to: DELETE from tags WHERE name = ?;
		const rowCount = await Tags.destroy({ where: { discordID: tagDiscordID } });
		if (!rowCount) return interaction.reply('That tag did not exist.');

		return interaction.reply('Tag deleted.');
	}
});


//elo-rating
/*
var playerWin = false;
var result = EloRating.calculate(1750, 1535, playerWin);
 
console.log(result.playerRating) // Output: 1735
console.log(result.opponentRating) // Output: 1550
 
result = EloRating.calculate(1750, 1535);
 
console.log(result.playerRating) // Output: 1754
console.log(result.opponentRating) // Output: 1531
*/

// トークンを使ってDiscordにログイン
client.login(process.env.DiscordBotTest_token);