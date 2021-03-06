// Discord.jsモジュールを読み込む
const Sequelize = require('sequelize');
const EloRating = require('elo-rating');
const { Client, Intents } = require('discord.js');
require('dotenv').config();

// 新しいDiscordクライアントを作成
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

//sequelizeの設定
const sequelize = new Sequelize('database', 'username', 'password', {
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
	name: {
		type: Sequelize.STRING,
		unique: true,
	},
	description: Sequelize.TEXT,
	username: Sequelize.STRING,
	usage_count: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
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
		const tagName = interaction.options.getString('name');
		const tagDescription = interaction.options.getString('description');

		try {
			// equivalent to: INSERT INTO tags (name, descrption, username) values (?, ?, ?);
			const tag = await Tags.create({
				name: tagName,
				description: tagDescription,
				username: interaction.author.username,
			});
			return interaction.reply(`Tag ${tag.name} added.`);
		} catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				return interaction.reply('That tag already exists.');
			}
			return interaction.reply('Something went wrong with adding a tag.');
		}
	} else if (commandName === 'tag') {
		const tagName = interaction.options.getString('name');

		// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
		const tag = await Tags.findOne({ where: { name: tagName } });
		if (tag) {
			// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
			tag.increment('usage_count');
			return interaction.reply(tag.get('description'));
		}
		return interaction.reply(`Could not find tag: ${tagName}`);
	} else if (commandName === 'edittag') {
		const tagName = interaction.options.getString('name');
		const tagDescription = interaction.options.getString('description');

		// equivalent to: UPDATE tags (descrption) values (?) WHERE name = ?;
		const affectedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });
		if (affectedRows > 0) {
			return interaction.reply(`Tag ${tagName} was edited.`);
		}
		return interaction.reply(`Could not find a tag with name ${tagName}.`);
	} else if (commandName === 'taginfo') {
		const tagName = interaction.options.getString('name');

		// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
		const tag = await Tags.findOne({ where: { name: tagName } });
		if (tag) {
			return interaction.reply(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
		}
		return interaction.reply(`Could not find tag: ${tagName}`);
	} else if (commandName === 'showtags') {
		const tagList = await Tags.findAll({ attributes: ['name'] });
		const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';
		return interaction.reply(`List of tags: ${tagString}`);
	} else if (commandName === 'removetag') {
		// equivalent to: DELETE from tags WHERE name = ?;
		const tagName = interaction.options.getString('name');
		const rowCount = await Tags.destroy({ where: { name: tagName } });
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