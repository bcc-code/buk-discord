import { Message, MessageEmbed, TextChannel } from 'discord.js';
import CommandObject from '../classes/command';
import sanity from '../classes/sanity';

const functions = {
    async teams(message: Message, args: string[]) {
        const result = await sanity.GetTournament(args[1]) as Tournament;
        const embed = new MessageEmbed()
            .setTitle(`TEAMS`)
            .setDescription('All teams in tournament ' + result.title.en);

        console.log(result);

        const teams = result?.teams || [];
        teams.forEach((team) => {
            const players = [];
            team.participant.players.forEach((player) => players.push(player.discordId));
            embed.addField(team.participant.name, `<@${team.participant.captain.discordId}> [**C**]${players ? `\n<@${players.join('>\n<@')}>` : '' }`, true);
        });

        message.channel.send(embed);
        
        return true;
    },
    async info(message: Message, args: string[]) {
        if (!message.member.roles.cache.find(r => r.name === "Moderator")) return false;
        const tournament = await sanity.GetTournament(args[1]) as Tournament;

        const embed = new MessageEmbed()
            .setTitle('TOURNAMENT')
            .setDescription(tournament.signupType == 'team' ? `All teams in this tournament ${tournament.title.en}` : `All players in tournament ${tournament.title.en}`);
        
        if (tournament.signupType == 'solo') {
            for (const participant of tournament.soloPlayers) {
                const player = participant.participant;
                embed.addField(`**${player.name}**`, `${player.email}\n${player.location}\n<@${player.discordId}>\n${player.phoneNumber}\n\n${participant.information.join("\n")}\n`);
            }
        } else if (tournament.signupType == 'team') {
            for (const participant of tournament.teams) {
                const team = participant.participant;
                embed.addField(`**${team.name}**`, `${team.organization.name}\nSize: ${team.players.length+1}\n${team.captain.name}\n${team.captain.location}\n${team.captain.phoneNumber}\n<@${team.captain.discordId}>\n\n${participant.information.join("\n")}\n`)
            }
        }

        await message.channel.send(embed);
        return true;
    },
    async channel(message: Message, args: string[]) {
        if (!message.member.roles.cache.find(r => r.name === "Administrator")) return false;
        const tournament = await sanity.GetTournament(args[1]) as Tournament;

        const channel = message.channel as TextChannel;

        await channel.createOverwrite(tournament.responsible.discordId, {
            'MANAGE_CHANNELS': true,
            'VIEW_CHANNEL': true,
            'MANAGE_MESSAGES': true,
        });
        
        await new Promise(resolve => {setTimeout(resolve, 1000)});

        const captains: string[] = [];

        for (const team of tournament.teams) {
            captains.push(team.participant.captain.discordId);
        }

        for (const cap of captains) {
            await new Promise(resolve => {setTimeout(resolve, 1000)});
            console.log(`captain added`)
            await channel.createOverwrite(cap, {
                'VIEW_CHANNEL': true,
            });
        }
    }
}

class TournamentCommands extends CommandObject {
    // functions = ['help', 'info'];
    tournament = async (message: Message, args: string[]) => {
        return await functions[args[0]]?.(message, args) || false;
    };
}

const tournamentCommands = new TournamentCommands();

export default tournamentCommands;
