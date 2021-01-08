import { Message, TextChannel } from 'discord.js';
import config from '../config';
import { client, directMessages, guilds } from '../index';
import { embeds, Help } from '../methods/text';
import commands from '../commands';
import DirectMessage from '../classes/directMessage';
// import { aliases } from "../commands";

export default async (message: Message): Promise<void> => {
    if (message.author.bot) return;

    if (!message.guild) {
        const guild =
            client.guilds.cache.get(config.discord.guildId) ||
            client.guilds.cache.first();
        console.log('DM RECEIVED');
        if (message.content.startsWith('!')) {
            message.channel.send(Help.help);
            return;
        }

        const channel = guild?.channels.cache.find(
            (c) => c.name === 'admin'
        ) as TextChannel;

        const embed = embeds.dm(message);

        directMessages.push(new DirectMessage(message));

        channel?.send(embed);
        return;
    }

    message.channel = message.channel as TextChannel;

    if (
        message.channel.name === 'commands' &&
        !message.content.startsWith(config.discord.prefix)
    ) {
        message.delete({ timeout: 1000 });
        return;
    }

    if (guilds[message.guild.id].config.filter.enabled) {
        if (guilds[message.guild.id].filterCheck(message)) {
            message.channel
                .send('Unaccepted link')
                .then((msg) => msg.delete({ timeout: 5000 }));
            message.delete({ timeout: 1000 });
            (message.channel.guild.channels.cache.find(
                (c) => c.name === 'admin'
            ) as TextChannel).send(
                `Filtered message from <@${message.member.id}> in <#${message.channel.id}>:\n\n${message.content}`
            );
            return;
        }
    }

    if (message.content.indexOf(config.discord.prefix) !== 0) return;

    const args = message.content
        .slice(config.discord.prefix.length)
        .trim()
        .split(/ +/g);

    const command = args.shift().toLowerCase();

    await commands[command]?.(message, args); // || message.channel.send("Unknown command").then(msg => msg.delete({ timeout: 5000 }));

    if (!['dm', 'say'].includes(command)) message.delete({ timeout: 5000 });
};
