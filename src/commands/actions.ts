import { Message } from 'discord.js';
import sanity from '../classes/sanity';
import CommandObject from '../classes/command';
import { writeFileSync } from 'fs';
import { guilds } from '..';

class ActionsCommands extends CommandObject {
    // [key: string]: (message: Message, args: string[]) => Promise<void>;
    // functions = ['react', 'dm', 'say', 'pin', 'dump', 'edit', 'unverified', 'invalidmembers'];

    react = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const channel = message.mentions.channels.first();
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

        const channel = message.mentions.channels.first();

        args.splice(0, 1);

        const sayMessage = args.join(' ');
        if (message.attachments.first()) {
            channel.send(sayMessage, {
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
            const channel = message.mentions.channels.first();
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
            const channel = message.mentions.channels.first();
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
        const channel = message.mentions.channels.first();
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

    orgrole = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator')){
            return false;
        }
        
        const role = message.mentions.roles.first();
        const orgId = args[1];
        if (role && orgId) {
            writeFileSync(`./data/organizations/${orgId}`, role.id);
            return true;
        }
        return false;
    }

    unverified = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;

        const players = await sanity.GetValidMembers();

        const unverifiedMembers = [];

        const subMembers = []

        message.guild.members.cache.forEach((member) => {
            const player = players.find((p) => p.discordId === member.id);
            if (!player) {
                const subMember = players.find((p) => p.moreDiscordUsers?.find(d => d.discordId == member.id) != undefined);
                if (subMember) {
                    subMembers.push(`<@${member.id}> (<@${subMember.discordId}>)`);
                } else {
                    if (unverifiedMembers.length < 60) unverifiedMembers.push(`<@${member.id}>`);
                }
            }
        });
        await message.channel.send(`**UNVERIFIED MEMBERS**\n${unverifiedMembers.join('\n')}\n\n**SUB ACCOUNTS**\n${subMembers.join('\n')}`);
        return true;
    };

    missingmembers = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;

        const players = await sanity.GetValidMembers();

        const missingRoles = [];

        for (const player of players) {
            const member = message.guild.members.cache.get(player.discordId);

            if (member) {
                if (!member.roles.cache.find(r => r.name === "Member")) {
                    await sanity.VerifyUser(member);
                    await new Promise(resolve => {
                        setTimeout(resolve, 500);
                    });
                }
            }
        }

        await message.channel.send("**ASSIGNED MEMBERS**\n<@" + missingRoles.join(">\n<@") + ">");

        return true;
    }

    invalidmembers = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const players = await sanity.GetValidMembers();

        const unverifiedMembers = [];
        const subMembers = [];
        message.guild.members.cache.forEach((member) => {
            if (member.user.bot) return;
            const player = players.find((p) => p.discordId === member.id);
            if (!player) {
                
                const subMember = players.find((p) => p.moreDiscordUsers?.find(d => d.discordId == member.id) != undefined);
                if (subMember) {
                    subMembers.push(`<@${member.id}> (<@${subMember.discordId}>)`);
                } else if (member.roles.cache.array().length > 1) {
                    if (unverifiedMembers.length < 60) unverifiedMembers.push(`<@${member.id}>`);
                }
            }
        });
        message.channel.send("**INVALID MEMBERS**\n" + unverifiedMembers.join('\n'));
        return true;
    };

    inactivemembers = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const members = await sanity.GetInactiveMembers();

        const inactiveMembers = [];

        for (const id of members) {
            const member = await message.guild.members.fetch(id);
            if (member?.roles.cache.find(r => r.name === "Member")) {
                inactiveMembers.push(id);
            }
        }

        message.channel.send(inactiveMembers.length + " LOST ACCESS");

        if (inactiveMembers.length < 50) {
            await message.channel.send(`**INACTIVE MEMBERS**\n<@${inactiveMembers.join(`>\n<@`)}>`);
        } else {
            for (let i = 0; i < (inactiveMembers.length % 50); i++) {
                //await message.channel.send(`**INACTIVE MEMBERS**\n<@${inactiveMembers.slice(i*50, i*50+50).join(`>\n<@`)}>`);
            }
        }
        return true;
    }

    refreshconfig = async (message: Message) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        
        await guilds[message.guild.id]?.refreshConfig();
        return true;
    }

    // test = async (message: Message, args: string[]) => {
    //     return true;
    // };
}

const actionsCommands = new ActionsCommands();
export default actionsCommands;
