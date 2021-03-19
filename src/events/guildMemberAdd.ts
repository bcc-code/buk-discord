import { GuildMember } from 'discord.js';
import { guilds } from '..';
import sanity from '../classes/sanity';
import config from '../config';

export default async (member: GuildMember): Promise<void> => {
    if (config.debug) return console.log('DEBUG: TRUE | MEMBER JOIN IGNORED');

    if (!guilds[member.guild.id].config.verifyMembers) return console.log("CHECKING NOT ENABLED ON SERVER");

    sanity.VerifyUser(member);
};
