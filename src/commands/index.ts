import voice from './voice';
import text from './text';
import actions from './actions';
import embeds from './embeds';
import organization from './organization';
import guild from './guild';
import tournament from './tournament';
import CommandObject from '../classes/command';
import sanity from './sanity';
import { Message } from 'discord.js';

class Commands {
    constructor(imports: CommandObject[]) {
        for (const imp of imports) {
            for (const command of Object.keys(imp)) {
                this[command] = imp.getCommand(command);
            }
        }
    }
    getcommands(message: Message) {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        message.channel.send(Object.keys(this));
        return true;
    }
}

const commands = new Commands([
    voice,
    actions,
    embeds,
    text,
    organization,
    guild,
    tournament,
    sanity,
]);

export default commands;
