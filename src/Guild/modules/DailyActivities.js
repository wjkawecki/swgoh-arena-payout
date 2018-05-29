import Discord from 'discord.js';

export default class DailyActivities {
	constructor(Client, config) {
		this.config = config;

		console.log(`=== ${config.guildName}.DailyActivities ready${config.DEV ? ' (DEV mode)' : ''}`);

		this.Client = Client;

		this.initChannels(config.channels);
		this.listenToMessages();

		if (config.DEV) {
			// this.clearChannel(this.channels.bot_playground, true);
		} else {
			this.channels.bot_playground.send(`${config.guildName}.DailyActivities on duty!`);
		}

		this.main();
	}

	async main() {
		try {
			console.log(`${this.config.guildName}.DailyActivities.main()`);

			this.scheduleReminder();
		} catch (err) {
			console.log(err);
		}
	}

	initChannels(channels) {
		this.channels = {};

		for (let key in channels) {
			if (this.config.DEV) {
				this.channels[key] = this.Client.channels.get(channels.bot_playground);
			} else {
				this.channels[key] = this.Client.channels.get(channels[key]);
			}
		}
	}

	listenToMessages() {
		this.Client.on('message', msg => {
			switch (msg.content.toLowerCase()) {

				case '-tickets':
				case '- tickets':
				case '!tickets':
					this.scheduleReminder(true);
					break;

				case '-monday':
				case '- monday':
				case '!monday':
					this.dayReminder(msg, 'Monday');
					break;

				case '-tuesday':
				case '- tuesday':
				case '!tuesday':
					this.dayReminder(msg, 'Tuesday');
					break;

				case '-wednesday':
				case '- wednesday':
				case '!wednesday':
					this.dayReminder(msg, 'Wednesday');
					break;

				case '-thursday':
				case '- thursday':
				case '!thursday':
					this.dayReminder(msg, 'Thursday');
					break;

				case '-friday':
				case '- friday':
				case '!friday':
					this.dayReminder(msg, 'Friday');
					break;

				case '-saturday':
				case '- saturday':
				case '!saturday':
					this.dayReminder(msg, 'Saturday');
					break;

				case '-sunday':
				case '- sunday':
				case '!sunday':
					this.dayReminder(msg, 'Sunday');
					break;

				case '-help':
				case '- help':
				case '!help':
					this.helpReply(msg);
					break;
			}

			if (this.isBotMentioned(msg))
				this.helpReply(msg);
		});
	}

	dayReminder(msg, day) {
		let embed = new Discord.RichEmbed(),
			before,
			after;

		switch (day) {

			case 'Monday':
				before = {
					activity: 'Cantina Battles',
					desc: `:zap:  **Spend** Cantina Energy
:heavy_multiplication_x:  **Save** Normal Energy`
				};

				after = {
					activity: 'Light Side Battles',
					desc: `:zap:  **Spend** Normal Energy on Light Side Battles
:heavy_multiplication_x:  **Save** any other Energy (don't forget your 600)`
				};
				break;

			case 'Tuesday':
				before = {
					activity: 'Light Side Battles',
					desc: `:zap:  **Spend** Normal Energy on Light Side Battles
:heavy_multiplication_x:  **Save** any other Energy (don't forget your 600)`
				};

				after = {
					activity: 'Energy Battles',
					desc: `:zap:  **Spend** any Energy in Battles`
				};
				break;

			case 'Wednesday':
				before = {
					activity: 'Energy Battles',
					desc: `:zap:  **Spend** any Energy in Battles`
				};

				after = {
					activity: 'Hard Mode Battles',
					desc: `:zap:  **Spend** Normal Energy on Hard Mode Battles`
				};
				break;

			case 'Thursday':
				before = {
					activity: 'Hard Mode Battles',
					desc: `:zap:  **Spend** Normal Energy on Hard Mode Battles
:heavy_multiplication_x:  **Save** Challenges (Dailies are fine)`
				};

				after = {
					activity: 'Challenges',
					desc: `:boom:  **Complete** Challenges
:heavy_multiplication_x:  **Save** Normal Energy`
				};
				break;

			case 'Friday':
				before = {
					activity: 'Challenges',
					desc: `:boom:  **Complete** Challenges
:heavy_multiplication_x:  **Save** Normal Energy`
				};

				after = {
					activity: 'Dark Side Battles',
					desc: `:zap:  **Spend** Normal Energy on Dark Side Battles`
				};
				break;

			case 'Saturday':
				before = {
					activity: 'Dark Side Battles',
					desc: `:zap:  **Spend** Normal Energy on Dark Side Battles
:heavy_multiplication_x:  **Save** Arena Battles
:heavy_multiplication_x:  **Save** Cantina Energy`
				};

				after = {
					activity: 'Arena Battles',
					desc: `:boom:  **Complete** Arena Battles (5)
:heavy_multiplication_x:  **Save** Cantina Energy`
				};
				break;

			case 'Sunday':
				before = {
					activity: 'Arena Battles',
					desc: `:boom:  **Complete** Arena Battles (5)
:heavy_multiplication_x:  **Save** Cantina Energy
:heavy_multiplication_x:  **Save** Normal Energy`
				};

				after = {
					activity: 'Cantina Battles',
					desc: `:zap:  **Spend** Cantina Energy
:heavy_multiplication_x:  **Save** Normal Energy`
				};
				break;

		}

		embed
			.setAuthor(`${day}`)
			.addField(`${before.activity} - before reset`, before.desc)
			.addField(`${after.activity} - after reset`, after.desc)
			.setColor(0xf0c330);

		msg.channel.send(embed);
	}

	scheduleReminder(manualReminder = false) {
		let remindHoursBefore = 2,
			now = new Date(),
			reset = new Date(now),
			diff;

		reset.setUTCHours(this.config.resetTimeUTC.hour, this.config.resetTimeUTC.minute, 0, 0);
		if (reset < now) reset.setDate(reset.getDate() + 1);
		this.resetDay = reset.getUTCDay();
		diff = reset.getTime() - now.getTime();

		if (this.config.DEV) {
			// diff = 30000;
		}

		if (manualReminder) {
			this.channels.guild_lounge.send(`<@&${this.config.roles.member}> we have ${this.getReadableTime(diff)} left to get as many raid tickets as possible. Go grab them now!`);
		} else {
			console.log(`${this.config.guildName}.DailyActivities.scheduleReminder(): ${this.getReadableTime(diff)} to reset`);

			let reminderDiff = diff - (remindHoursBefore * 60 * 60 * 1000);

			if (reminderDiff > 0) {
				setTimeout(() => {
					this.channels.guild_lounge.send(`<@&${this.config.roles.member}> ${remindHoursBefore} hours left to get your :six::zero::zero: daily tickets. Go grab them now!`);
				}, reminderDiff);
			}

			setTimeout((resetDay = this.resetDay) => {
				let embed = new Discord.RichEmbed(),
					activity = '',
					desc = '';

				switch (resetDay) {

					case 0: // Sunday
						activity = 'Cantina Battles';
						desc = `
:zap:  **Spend** Cantina Energy
:heavy_multiplication_x:  **Save** Normal Energy
:heavy_multiplication_x:  **Save** Galactic War Battles (unless reset available)`;
						break;

					case 1: // Monday
						activity = 'Light Side Battles';
						desc = `
:zap:  **Spend** Normal Energy on Light Side Battles
:heavy_multiplication_x:  **Save** Galactic War Battles`;
						break;

					case 2: // Tuesday
						activity = 'Galactic War Battles';
						desc = `
:boom:  **Complete** Galactic War Battles
:heavy_multiplication_x:  **Save** Normal Energy`;
						break;

					case 3: // Wednesday
						activity = 'Hard Mode Battles';
						desc = `
:zap:  **Spend** Normal Energy on Hard Mode Battles
:heavy_multiplication_x:  **Save** Challenges`;
						break;

					case 4: // Thursday
						activity = 'Challenges';
						desc = `
:boom:  **Complete** Challenges
:heavy_multiplication_x:  **Save** Normal Energy`;
						break;

					case 5: // Friday
						activity = 'Dark Side Battles';
						desc = `
:zap:  **Spend** Normal Energy on Dark Side Battles
:heavy_multiplication_x:  **Save** Arena Battles`;
						break;

					case 6: // Saturday
						activity = 'Arena Battles';
						desc = `
:boom:  **Complete** Arena Battles
:heavy_multiplication_x:  **Save** Cantina Energy`;
						break;
				}

				desc += `

Thank you for your raid tickets contribution!`;

				embed
					.setAuthor(`New Guild Activity: ${activity}`)
					.setDescription(desc)
					.setColor(0xf0c330);

				this.channels.guild_lounge.send(embed);

				this.main();
			}, diff);
		}
	}

	helpReply(msg) {
		msg.reply(`here is the list of my __DailyActivities__ commands:
\`-tickets\` - sends a global motivating message with remaining time to guild reset.
\`-monday\`
\`-tuesday\`
\`-wednesday\`
\`-thursday\`
\`-friday\`
\`-saturday\`
\`-sunday\`
\`-help\` - this is what you are reading right now.`);
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
		console.log(`${this.config.guildName}.DailyActivities.clearChannel()`);

		if (removeAll) {
			const messages = await channel.fetchMessages().catch(console.error);

			if (messages) {
				messages.forEach(async (message) => {
					await message.delete().catch(console.error);
				});
			}
		} else {
			const message = await channel.fetchMessage(this.lastMessageId).catch(console.error);

			if (message)
				await message.delete().catch(console.error);
		}
	}
}