import { User, MessageReaction, TextChannel } from 'discord.js';
import config from '../config';
import sanity from '../classes/sanity';
import { channels, guilds } from '..';
import TemporaryChannel from '../classes/temporaryChannel';
import { Help } from '../methods/text';
import { message } from '.';

interface Functions {
    [key: string]: (reaction: MessageReaction, user: User) => Promise<void>;
}

const functions: Functions = {
    async welcome(reaction, user) {
        const member =
            reaction.message.guild?.members.cache.get(user.id) || null;
        if (member) {
            if (member.roles.cache.find((r) => r.name === 'Member')) return;
            sanity.VerifyUser(member);
        }
    },
    async voice(reaction, user) {
        const member =
            reaction.message.guild?.members.cache.get(user.id) || null;
        const alts = {
            '🔒': 'lock',
            '🕵️': 'close',
            '🙈': 'hide',
            '🚫': 'reset',
            '💬': 'text',
            '🌐': 'organization',
            '🏳️': 'country',
        };
        if (member.voice.channel) {
            const channel = channels[member.voice.channel.id];
            if (channel) {
                channel[alts[reaction.emoji.name]]?.(member);
            } else if (
                member.voice.channel
                    .permissionsFor(member)
                    ?.has('MANAGE_CHANNELS')
            ) {
                channels[member.voice.channel.id] = new TemporaryChannel(
                    member.voice.channel,
                    member,
                    true
                );
                channels[member.voice.channel.id][alts[reaction.emoji.name]]?.(
                    member
                );
                member.send(
                    'Bot crashed, but you gained control of the group. Use it wisely.'
                );
            }
        } else {
            member.send('You are not in a voice channel.');
        }
    },
    async communityRoles(reaction, user) {
        const guild = reaction.message.guild;
        const member = guild?.members.cache.get(user.id);
        const role = guilds[guild?.id]?.roles.find((m) => m.type == "community" && m.key === reaction.emoji.name)?.role;
        if (!role) {
            console.log('ROLE NO FOUND');
            return;
        }
        if (member.roles.cache.get(role.id)) {
            await member.roles.remove(role);
            await member.send(`Role: **${role.name}** was removed from you.\n*You no longer have access to the dedicated ${role.name} channels.*`);
        } else {
            await member.roles.add(role);
            await member.send(`Role: **${role.name}** was assigned to you.\n*You should now have access to the dedicated ${role.name} channels.*`);
            if (reaction.emoji.name == '👧') {
                const channel = guild.channels.cache.get('810867038015717426') as TextChannel;
                if (channel.type == 'GUILD_TEXT') {
                    await channel.send(`User: <@${member.id}> got the Girl role. PMO name: ${(await sanity.GetMember(member.id)).name}`)
                }
            }
        }
    },
    async games(reaction, user) {
        const member =
            reaction.message.guild?.members.cache.get(user.id) || null;
        const role = guilds[reaction.message.guild.id].roles.find((g) => g.key === reaction.emoji.name)?.role;
        if (!role) {
            console.log('ROLE NOT FOUND');
            return;
        }
        if (member.roles.cache.get(role.id)) {
            await member.roles.remove(role);
            await member.send(`Role: **${role.name}** was removed from you.\n*You no longer have access to the dedicated ${role.name} channels.*`);
        } else {
            await member.roles.add(role);
            await member.send(`Role: **${role.name}** was assigned to you.\n*You should now have access to the dedicated ${role.name} channels.*`);
        }
    },
    async information(reaction, user) {
        if (reaction.emoji.name == '🌐') {
            const member = reaction.message.guild?.members.cache.get(user.id);
            if (!member) return;
            const orgs = await sanity.GetOrganizationsForMember(member);
            const orgNames = [];
            for (const org of orgs) {
                if (org.members.length >= 20 && org.discordRoleId) {
                    orgNames.push(org.name);
                    const role = reaction.message.guild.roles.cache.get(org.discordRoleId);
                    if (role) {
                        if (!member.roles.cache.get(role.id)) await member.roles.add(role);
                    }
                }
            }
            if (orgNames.length > 0) {
                await member.send(`**ORGANIZATIONS**\nYou have been assigned roles for the following organizations: \n*${orgNames.join('*\n*')}*`)
            } else {
                await member.send(`**ORGANIZATIONS**\nNo eligible organizations was found connected to your account. In order to get a dedicated role, the organization has to have more than 20 members and been in contact with a BUK Gaming moderator.`);
            }
            return;
        }
        if (reaction.emoji.name == '❗') {
            const member = reaction.message.guild?.members.cache.get(user.id);
            if (!member) return;
            const role = reaction.message.guild?.roles.cache.find(r => r.name === "Updates");
            if (!role) return;
            if (member.roles.cache.get(role.id)) {
                await member.roles.remove(role);
            } else {
                await member.roles.add(role);
            }
            return;
        }
        user.send(Help.help);
    },
};

export default async (reaction: MessageReaction, user: User): Promise<void> => {
    if (user.bot) return;

    if (!guilds[reaction.message.guild.id]?.config.reactions) return;

    if (reaction.message.guild.members.cache.get(user.id)?.roles.cache.find(r => r.name === "Member")) {

        const message =
            guilds[reaction.message.guild.id]?.config.messages.find(
                (m) => m.id === reaction.message.id
            ) || null;

        if (message) {
            await functions[message.key]?.(reaction, user);
            if (!config.debug) await reaction.users.remove(user.id);
        }
    } else {
        await user.send("You do not have permission to use these functions. Connect your account on https://buk.gg or contact a **Moderator** for help.");
        if (!config.debug) await reaction.users.remove(user.id);
    }
};
