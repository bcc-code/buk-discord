import { Message, User } from "discord.js";

export default class DirectMessage {
    public author: User;
    public content: string;

    constructor(message: Message) {
        this.author = message.author;
        this.content = message.content;
    }

    public async reply(message: string, embed?: boolean): Promise<void> {
        if (embed === true) {

        } else {
            await this.author.send(message);
        }
    }
}