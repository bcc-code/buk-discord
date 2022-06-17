
import env from 'dotenv';
env.config();
import Discord, { Intents, TextChannel } from 'discord.js';
import config from './config';
import * as events from './events';
import TemporaryChannel from './classes/temporaryChannel';
import Guild from './classes/guild';
import DirectMessage from './classes/directMessage';


if (process.argv[2] === 'debug') {
    config.debug = true;
    console.log('RUNNING IN DEBUG MODE');
}

export const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

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