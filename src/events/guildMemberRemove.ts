import { GuildMember } from 'discord.js';
import sanity from '../classes/sanity';
import config from '../config';

export default async (member: GuildMember): Promise<void> => {
    if (config.debug) return console.log('DEBUG: TRUE | MEMBER LEAVE IGNORED');

    sanity.RevokeMembership(member);
};
