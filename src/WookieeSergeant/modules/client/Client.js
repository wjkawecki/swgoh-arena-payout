import Discord from 'discord.js';

const clientGame = 'Kashyyyk';

export default class Client {
	constructor(botToken) {
		this.client = new Discord.Client();
		this.client.on('ready', async () => {
			this.client.user.setGame(clientGame);

			console.log('WookieeSergeant.Client');
		});

		this.client.login(botToken);
	}
}


