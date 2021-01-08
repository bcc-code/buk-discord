import CommandObject from '../classes/command';
import { Message } from 'discord.js';
import { guilds } from '..';

class GuildCommands extends CommandObject {
    setup = async (message: Message, args: string[]) => {
        if (!message.member.roles.cache.find((r) => r.name === 'Administrator'))
            return false;
        const funcs = {
            reactions() {
                return guilds[message.guild.id].toggleReactions()
                    ? 'Enabled'
                    : 'Disabled';
            },
            messages() {
                args.splice(0, 1);
                return guilds[message.guild.id].setMessages(args.join(' '))
                    ? 'Messages config set'
                    : 'Messages config set';
            },
            delete() {
                guilds[message.guild.id].delete();
                return 'Deleted';
            },
            verification() {
                return guilds[message.guild.id].toggleVerification()
                    ? 'Enabled'
                    : 'Disabled';
            },
            getconfig() {
                return guilds[message.guild.id].getConfig();
            },
            voice() {
                return guilds[message.guild.id].toggleVoice()
                    ? 'Enabled'
                    : 'Disabled';
            },
            filterchanneladd() {
                return guilds[message.guild.id].filterChannelAdd(
                    message.mentions.channels.first()?.id
                )
                    ? 'Added'
                    : 'Error';
            },
            filterclearchannel() {
                return guilds[message.guild.id].filterClearChannels()
                    ? 'Removed'
                    : 'Error';
            },
            filterwhitelistadd() {
                return guilds[message.guild.id].filterWhitelistAdd(args[1])
                    ? 'Added'
                    : 'Error';
            },
            filterwhitelistremove() {
                return guilds[message.guild.id].filterWhitelistRemove(args[1])
                    ? 'Removed'
                    : 'Error';
            },

            filter() {
                return guilds[message.guild.id].toggleFilter()
                    ? 'Enabled'
                    : 'Disabled';
            },
            getfilter() {
                return guilds[message.guild.id].filterGet();
            },
        };
        message.channel.send(
            funcs[args[0].toLowerCase()]?.() ||
                `Function not found. Available functions: ${Object.keys(
                    funcs
                ).join(', ')}`
        );
        return true;
    };
}

const guildCommands = new GuildCommands();

export default guildCommands;
