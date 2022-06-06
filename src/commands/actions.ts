import { Message, TextBasedChannel } from 'discord.js';
import sanity from '../classes/sanity';
import CommandObject from '../classes/command';
import { guilds } from '..';

class ActionsCommands extends CommandObject {
    // [key: string]: (message: Message, args: string[]) => Promise<void>;
    // functions = ['react', 'dm', 'say', 'pin', 'dump', 'edit', 'unverified', 'invalidmembers'];

    react = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const channel = message.mentions.channels.first() as TextBasedChannel;
        const msg = await channel?.messages.fetch(args[1]);
        const emoji = args[2];
        msg?.react(emoji);
        return true;
    };

    verifyuser = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const member = message.mentions.members.first();
        await sanity.VerifyUser(member);
        return true;
    };

    dm = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const player = message.mentions.members.first();
        args.shift();
        const msg = args.join(' ');
        player?.send(msg);
        return true;
    };

    say = async (message: Message, args: string[]) => {
        if (
            !message.member.roles.cache.some((r) =>
                ['Administrator', 'Moderator', 'Tournament Admin'].includes(
                    r.name
                )
            )
        )
            return false;

        const channel = message.mentions.channels.first() as TextBasedChannel;

        args.splice(0, 1);

        const sayMessage = args.join(' ');
        if (message.attachments.first()) {
            channel.send({
                content: sayMessage,
                files: [message.attachments.first().url],
            });
        } else {
            channel.send(sayMessage);
        }
        return true;
    };

    pin = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        if (args[0] && !isNaN(Number(args[1])) && args[1].length === 18) {
            const channel = message.mentions.channels.first() as TextBasedChannel;
            if (channel) {
                const msg = await channel.messages.fetch(args[1]);
                if (msg) {
                    msg.pin();
                }
            } else {
                message.channel.send('_Invalid channel._');
            }
        }
        return true;
    };

    dump = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        if (args[0] && !isNaN(Number(args[1])) && args[1].length === 18) {
            const channel = message.mentions.channels.first() as TextBasedChannel;
            const msg = await channel?.messages.fetch(args[1]);
            const content =
                msg?.content
                    .toString()
                    .replace(/`/g, '\\`')
                    .replace(/\*/g, '\\*')
                    .replace(/_/g, '\\_') || 'Usage: !dump [#channel] [msgId]';
            message.channel.send(content);
        } else {
            message.channel.send('Usage: !dump [#channel] [msgId]');
        }
        return true;
    };

    edit = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const channel = message.mentions.channels.first() as TextBasedChannel;
        args.shift();
        if (!args[0] || args[0].length !== 18) {
            message.channel.send('Usage: !edit #channel msgId [new message]');
            return false;
        }
        channel?.messages.fetch(args[0]).then((newMessage) => {
            args.shift();
            const messageContent = args.join(' ');
            newMessage.edit(messageContent);
        });
        return true;
    };

    refreshconfig = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        
        await guilds[message.guild.id]?.refreshConfig();
        return true;
    }
}

const actionsCommands = new ActionsCommands();
export default actionsCommands;
