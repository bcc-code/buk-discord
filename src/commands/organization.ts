import { Message, MessageEmbed } from 'discord.js';
import sanity from '../classes/sanity';
import CommandObject from '../classes/command';

class OrganizationCommands extends CommandObject {
    getorg = async (message: Message) => {
        const orgs = await sanity.GetOrganizationsForMember(message.member);
        const allOrgs = [];
        orgs.forEach((org) => {
            const embed = new MessageEmbed()
                .setTitle(org.name)
                .setDescription('An organization')
                .setColor('DARK_AQUA');
            org.members.forEach((member) => {
                if (member.role === 'member') return;
                embed.addField(
                    member.role.toUpperCase(),
                    `<@${member.player.discordId}>`,
                    true
                );
            });
            allOrgs.push(embed);
        });
        allOrgs.forEach((embed) => {
            message.channel.send(embed);
        });
        return true;
    };
}

const organizationCommands = new OrganizationCommands();

export default organizationCommands;
