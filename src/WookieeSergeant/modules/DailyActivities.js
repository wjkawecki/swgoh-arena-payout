const DEV = true;
import Discord from 'discord.js';

const channels = {
		the_guild_lounge: '324023862771712011',
		bot_playground: '371742456653414410'
	},
	roles = {
		officer: '324139861709946901',
		shavedWookiee: '324184776871510016'
	},
	resetTimeUTC = {
		hour: 23,
		minute: 30
	};

export default class DailyActivities {
	constructor(Client) {
		console.log(`WookieeSergeant.DailyActivities ready${DEV ? ' (DEV mode)' : ''}`);

		this.Client = Client;

		this.initChannels(channels);
		this.listenToMessages();

		if (DEV) {
			this.clearChannel(this.channels.bot_playground, true);
		}

		this.main();
	}

	async main() {
		try {
			console.log('WookieeSergeant.DailyActivities.main()');

			this.scheduleReminder();
		} catch (err) {
			console.log(err);
		}
	}

	initChannels(channels) {
		this.channels = {};

		for (let key in channels) {
			if (DEV) {
				this.channels[key] = this.Client.channels.get(channels.bot_playground);
			} else {
				this.channels[key] = this.Client.channels.get(channels[key]);
			}
		}
	}

	listenToMessages() {
		this.Client.on('message', msg => {
			switch (msg.content.toLowerCase()) {

				case '-help':
					this.helpReply(msg);
					break;
			}

			if (this.isBotMentioned(msg))
				this.helpReply(msg);
		});
	}

	scheduleReminder() {
		let now = new Date(),
			reset = new Date(now),
			resetDay,
			diff;

		reset.setUTCHours(resetTimeUTC.hour, resetTimeUTC.minute, 0, 0);
		if (reset < now) reset.setDate(reset.getDate() + 1);
		this.resetDay = reset.getUTCDay();
		diff = reset.getTime() - now.getTime();

		console.log(`WookieeSergeant.DailyActivities.scheduleReminder(): ${this.getReadableTime(diff)} to reset`);

		setTimeout(() => {
			this.channels.the_guild_lounge.send(`<@&${roles.shavedWookiee}> 2 hours left to get your 600 daily tickets. Go grab them now!`);
		}, diff - (2 * 60 * 60 * 1000));

		setTimeout((resetDay = this.resetDay) => {
			let embed = new Discord.RichEmbed(),
				activity = '',
				desc = '';

			console.log('resetDay ' + resetDay);

			switch (resetDay) {

				case 0: // Sunday
					activity = 'Cantina Battles';
					desc = `
:zap:  **Spend** Cantina Energy
:heavy_multiplication_x:  **Save** Normal Energy
:heavy_multiplication_x:  **Save** Galactic War Battles (unless reset available)`;
					console.log(reset.getUTCDay());
					break;

				case 1: // Monday
					activity = 'Light Side Battles';
					desc = `
:zap:  **Spend** Normal Energy on Light Side Battles
:heavy_multiplication_x:  **Save** Galactic War Battles`;
					console.log(reset.getUTCDay());
					break;

				case 2: // Tuesday
					activity = 'Galactic War Battles';
					desc = `
:boom:  **Complete** Galactic War Battles
:heavy_multiplication_x:  **Save** Normal Energy`;
					console.log(reset.getUTCDay());
					break;

				case 3: // Wednesday
					activity = 'Hard Mode Battles';
					desc = `
:zap:  **Spend** Normal Energy on Hard Mode Battles
:heavy_multiplication_x:  **Save** Challenges`;
					console.log(reset.getUTCDay());
					break;

				case 4: // Thursday
					activity = 'Challenges';
					desc = `
:boom:  **Complete** Challenges
:heavy_multiplication_x:  **Save** Normal Energy`;
					console.log(reset.getUTCDay());
					break;

				case 5: // Friday
					activity = 'Dark Side Battles';
					desc = `
:zap:  **Spend** Normal Energy on Dark Side Battles
:heavy_multiplication_x:  **Save** Arena Battles`;
					console.log(reset.getUTCDay());
					break;

				case 6: // Saturday
					activity = 'Arena Battles';
					desc = `
:boom:  **Complete** Arena Battles
:heavy_multiplication_x:  **Save** Cantina Energy`;
					console.log(reset.getUTCDay());
					break;
			}

			embed
				.setAuthor(`New Guild Activity: ${activity}`)
				.setDescription(desc)
				.setColor(0x00bc9d);

			this.channels.the_guild_lounge.send(embed);

			this.main();
		}, diff);
	}

	helpReply(msg) {
		msg.reply(`here is the list of my __DailyActivities__ commands:\n\`-help\` - this is what you are reading right now.`);
	}

	isBotMentioned(msg) {
		return msg.mentions.users.has(this.Client.user.id);
	}

	getReadableTime(time, showSeconds = false) {
		time = new Date(time);

		if (showSeconds) {
			time = `${String(time.getUTCHours()).padStart(2, '00')}:${String(time.getUTCMinutes()).padStart(2, '00')}:${String(time.getUTCSeconds()).padStart(2, '00')}`;
		} else {
			time = `${String(time.getUTCHours()).padStart(2, '00')}:${String(time.getUTCMinutes()).padStart(2, '00')}`;
		}

		return time;
	}

	async clearChannel(channel, removeAll = false) {
		console.log(`WookieeSergeant.DailyActivities.clearChannel()`);

		if (removeAll) {
			const messages = await channel.fetchMessages();

			if (messages) {
				messages.forEach(async (message) => {
					await message.delete();
				});
			}
		} else {
			const message = await channel.fetchMessage(this.lastMessageId);

			if (message)
				await message.delete();
		}
	}
}
