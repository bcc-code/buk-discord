import { Message } from 'discord.js';
import { embeds } from '../methods/text';
import CommandObject from '../classes/command';

class EmbedCommands extends CommandObject {
    setinfo = async (message: Message, args: string[]) => {
        if (
            !message.member.roles.cache.some((r) =>
                ['Administrator'].includes(r.name)
            )
        )
            return false;
        if (args[0] && args[1].length === 18) {
            const channel = message.mentions.channels.first();
            const msg = await channel?.messages.fetch(args[1]);
            const information = embeds.info();
            msg?.edit(information);
        } else {
            message.channel.send('Usage: !setinfo [#channel] [msgId]');
        }
        return true;
    };
    setrules = async (message: Message, args: string[]) => {
        if (
            !message.member.roles.cache.some((r) =>
                ['Administrator'].includes(r.name)
            )
        )
            return false;
        if (args[0] && args[1].length === 18) {
            const channel = message.mentions.channels.first();
            const msg = await channel?.messages.fetch(args[1]);
            const information = embeds.setRules();
            msg?.edit(information);
        } else {
            message.channel.send('Usage: !setrules [#channel] [msgId]');
        }
        return true;
    };
}

const embedCommands = new EmbedCommands();
export default embedCommands;
