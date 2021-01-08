import { Message } from 'discord.js';
import sanity from '../classes/sanity';
import CommandObject from '../classes/command';

class SanityCommands extends CommandObject {
    syncmembers = async (message: Message) => {
        const guild = message.guild;
        // SYNC ALL PLAYERS WITH NO ORG ROLE

        const orgs = await sanity.fetch("*[_type == 'organization' && count(members) >= 20]{'members': members[].player->discordId, 'secondaryMembers': members[].player->moreDiscordUsers, discordRoleId}") as {discordRoleId: string, members: string[], secondaryMembers: {discordId: string}[][]}[]

        for (const org of orgs) {
            const role = guild.roles.cache.get(org.discordRoleId);
            if (!role) continue;

            
            for (const secondaryMembers of org.secondaryMembers) {
                if (!secondaryMembers) continue;
                for (const { discordId } of secondaryMembers) {
                    org.members.push(discordId);
                }
            }

            const membersWithRole = guild.members.cache.filter(m => m.roles.cache.get(role.id) != undefined);

            membersWithRole.forEach(member => {
                if (!org.members.includes(member.id)) {
                    message.channel.send(`<@${member.id}> should not have the role for <@&${org.discordRoleId}>`)
                }
            })

            for (const memberId of org.members) {
                //console.log("MEMBER", memberId)
                const member = guild.members.cache.get(memberId);
                if (member?.roles.cache.get(role.id)) continue;
                await member?.roles.add(role);
                await new Promise(resolve => setTimeout(resolve, 200))
            }
        }
        console.log("done")

        // SYNC ALL PLAYERS WITH NO GAME ROLE
        const teams = await sanity.fetch("*[_type == 'team']{'role': game->discordRoleId, 'captain': captain->discordId, 'players': players[]->discordId}") as [{
            role: string,
            captain: string,
            players: string[],
        }];

        //let i = 0;

        for (const team of teams) {
            //i++;
            // console.log(`TEAMS #${i}`);
            const role = guild.roles.cache.get(team.role);
            if (!role) continue;
            const captain = guild.members.cache.get(team.captain);
            if (!captain?.roles.cache.get(role.id)) {
                await captain?.roles.add(role);
                await new Promise(resolve => setTimeout(resolve, 400));
            }
            if (team.players?.length > 0) {
                //let y = 0;
                for (const player of team.players) {
                    //y++;
                    // console.log(`PLAYER #${y}`);
                    const member = guild.members.cache.get(player);
                    if (member?.roles.cache.get(role.id)) continue;
                    await member?.roles.add(role);
                    if (!member) {
                        console.log('NOT CONNECTED TO DISCORD ' + player);
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        console.log("SYNCED PLAYERS")
        await message.channel.send(`DONE. ORGS: ${orgs.length}, TEAMS: ${teams.length}`);
        return true;
    }
}

const sanityCommands = new SanityCommands();
export default sanityCommands;
