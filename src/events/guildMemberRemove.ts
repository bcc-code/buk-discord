import { GuildMember } from 'discord.js';
import sanity from '../classes/sanity';
import config from '../config';

export default async (member: GuildMember): Promise<void> => {
    if (config.debug) return console.log('DEBUG: TRUE | MEMBER LEAVE IGNORED');

    if (member.guild.id !== "551350238821220382") return;

    sanity.RevokeMembership(member);
};
