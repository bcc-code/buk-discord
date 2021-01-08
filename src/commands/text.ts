import { Message } from 'discord.js';
import { embeds, Help } from '../methods/text';
import CommandObject from '../classes/command';

class TextCommands extends CommandObject {
    // functions = ['help', 'info'];
    help = async (message: Message) => {
        message.member.send(Help.help);
        return true;
    };

    info = async (message: Message) => {
        message.member.send(embeds.info());
        return true;
    };

    organizations = async (message: Message) => {
        message.channel.send(embeds.organizations());
        return true;
    }
}

const textCommands = new TextCommands();

export default textCommands;
