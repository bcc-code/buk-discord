import voice from './voice';
import actions from './actions';
import embeds from './embeds';
import organization from './organization';
import guild from './guild';
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
}

const commands = new Commands([
    voice,
    actions,
    embeds,
    organization,
    guild,
    sanity,
]);

export default commands;
