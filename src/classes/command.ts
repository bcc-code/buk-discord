import { Message } from 'discord.js';

type CommandType = (
    message: Message | string,
    args?: string | string[]
) => Promise<boolean> | boolean | CommandType;

interface Command {
    [key: string]: CommandType;
    getCommand: (command: string) => CommandType;
}

class CommandObject implements Command {
    [key: string]: CommandType;
    getCommand(command: string): CommandType {
        return this[command];
    }
}

export default CommandObject;
