// import { Message, TextChannel } from 'discord.js';
//  // import * as overwatch from '../leaderboard/overwatch';
// import { MessageEmbed } from 'discord.js';
// import CommandObject from '../classes/command';

// const platforms = ['pc', 'xbl', 'psn'];

// class LeaderboardCommands extends CommandObject {
//     add = async (message: Message, args: string[]) => {
//         const channel = message.channel as TextChannel;
//         // if (channel.name !== "overwatch") return;
//         if (args.length !== 1 && !message.mentions.members.first()) {
//             message.channel.send('Usage: !ow Battle#Tag pc');
//             return true;
//         }
//         let member = message.member;
//         if (
//             message.member.roles.cache.find((r) => r.name === 'Moderator') &&
//             message.mentions.members.first()
//         ) {
//             member = message.mentions.members.first();
//         }
//         const battleTag = args[0].replace('#', '-');
//         const confirm = await overwatch.addPlayer(member, battleTag, 'pc');
//         if (confirm) {
//             message.channel.send('Added player.');
//             return true;
//         }
//         message.channel.send('Something happened, check dms');
//         return true;
//     };

//     get = async (message: Message, args: string[]) => {
//         const channel = message.channel as TextChannel;
//         // if (channel.name !== "overwatch") return;
//         let type = 'nothing';
//         let arg = args[0].replace('#', '-');
//         if (message.mentions.members.first()) {
//             type = 'mention';
//             arg = message.mentions.members.first().id;
//         }
//         const player = await overwatch.getPlayer(type, arg);
//         if (!player) return true;
//         const ranks = JSON.parse(player?.ranks);
//         console.log(ranks);
//         const embed = new MessageEmbed()
//             .setTitle('OVERWATCH STATS')
//             .setDescription(`Profile for player <@${player.member_id}>`)
//             .addField('MOST PLAYED', player.hero)
//             .addField('TANK', ranks.tank.sr, true)
//             .addField('DAMAGE', ranks.damage.sr, true)
//             .addField('SUPPORT', ranks.support.sr, true)
//             .setThumbnail(ranks[player.highest]?.tierIcon)
//             .setFooter(player.battletag.replace('-', '#'));
//         channel.send(embed);
//         return true;
//     };

//     leaderboard = async (message: Message, args: string[]) => {
//         message.channel.send(await overwatch.leaderboard());
//         return true;
//     };
// }

// const leaderboardCommands = new LeaderboardCommands();

// export default leaderboardCommands;
