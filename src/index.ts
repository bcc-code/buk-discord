import Discord, { TextChannel } from 'discord.js';
import config from './config';
import * as events from './events';
import TemporaryChannel from './classes/temporaryChannel';
import Guild from './classes/guild';
import DirectMessage from './classes/directMessage';

if (process.argv[2] === 'debug') {
    config.debug = true;
    console.log('RUNNING IN DEBUG MODE');
}

export const client = new Discord.Client();

// export const connection = mysql.createConnection({
//     host: config.database.address,
//     user: config.database.user,
//     password: config.database.password,
//     database: config.database.name,
//     port: 3306,
// });

// CONFIGURATION AND DATABASE SETUP
// export const data: {
//     [key: string]: Keyv;
// } = Object();
// ['tempTextChannels', 'guilds'].forEach((key: string) => {
//     data[
//         key
//     ] = new Keyv(
//         `mysql://${config.database.user}:${config.database.password}@${config.database.address}/${config.database.name}`,
//         { namespace: key }
//     );
//     data[key].on('error', (err: any) => console.log('CONNECTION ERROR', err));
// });

export const guilds: {
    [id: string]: Guild;
} = {};

export const channels: {
    [id: string]: TemporaryChannel;
} = {};

export const directMessages: DirectMessage[] = [];

export const sanityConfig: SanityGuild = {} as SanityGuild;

// DISCORD EVENTS SETUP
Object.keys(events).forEach((event: string) => {
    console.log('SETTING UP EVENT:', event);
    client.on(event, events[event]);
});

client.on('error', err => {
    if (err) {
        console.log(err);
        (client.guilds.cache.first()?.channels.cache.find(c => c.name == "admin") as TextChannel).send(err.message);
    }
})

client.login(config.discord.token);

//const toornament = new Toornament({apiKey: "", clientId: "", clientSecret: ""});

//toornament.getTournament("sso")