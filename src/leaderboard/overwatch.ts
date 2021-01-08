// import ow from 'overwatch-stats-api';
// import * as data from '../data';
// import { GuildMember, Message, MessageEmbed } from 'discord.js';
// import { client } from '../index';

// export async function addPlayer(
//     member: GuildMember,
//     battleTag: string,
//     platform: string
// ) {
//     console.log('ADDING PLAYER');
//     const exists = (await data.query(
//         `SELECT * FROM leaderboard_ow WHERE battletag = '${battleTag}'`
//     )) as any[];
//     if (exists.length > 0) {
//         member.send('User already added.');
//         return false;
//     }

//     const account = await ow.getBasicInfo(battleTag, platform).catch((err) => {
//         if (err.includes('PROFILE_PRIVATE')) {
//             member.send('PROFILE IS PRIVATE');
//         }
//     });
//     if (!account) {
//         console.log('NOTHING HERE');
//         return false;
//     }
//     const mostplayed = await ow.getMostPlayed(battleTag, platform);
//     const hero = Object.keys(mostplayed.competitive)[0].toUpperCase();

//     let highest: ow.RankRole;
//     let highestName: string;

//     for (const role of Object.keys(account.rank)) {
//         if (highest ? account.rank[role]?.sr > highest.sr : true) {
//             highest = account.rank[role];
//             highestName = role;
//         }
//     }

//     const user: OverwatchPlayer = {
//         id: member.id,
//         name: member.displayName,
//         battleTag: account.battletag,
//         highest: highestName,
//         highestSr: parseInt(highest.sr, 10),
//         rank: account.rank,
//     };

//     await data.query(
//         `INSERT INTO leaderboard_ow (member_id, name, battletag, highest_sr, highest, ranks, hero) VALUES ('${
//             user.id
//         }','${user.name}','${user.battleTag}', ${user.highestSr}, '${
//             user.highest
//         }', '${JSON.stringify(user.rank)}', '${hero}')`
//     );
//     return true;
// }

// export async function getPlayer(type: string, searchString: string) {
//     let query = `SELECT * FROM leaderboard_ow WHERE battletag = '${searchString.replace(
//         '#',
//         '-'
//     )}'`;
//     if (type === 'mention') {
//         const player = client.guilds.cache
//             .first()
//             .members.cache.get(searchString);
//         query = `SELECT * FROM leaderboard_ow WHERE member_id = '${player.id}'`;
//     }
//     const result = await data.query(query);
//     return result[0];
// }

// export async function leaderboard() {
//     const query = `SELECT * FROM leaderboard_ow ORDER BY highest_sr DESC`;
//     const result = (await data.query(query)) as any[];
//     console.log(result);
//     const embed = new MessageEmbed().setTitle('OVERWATCH LEADERBOARD');

//     const players = [];

//     let i = 1;
//     for (const player of result) {
//         const entry = `#${i} | ${player.battletag.replace('-', '#')} | <@${
//             player.member_id
//         }>`;
//         players.push(entry);
//         i++;
//     }

//     const description = players.join('\n');
//     embed.setDescription(description);

//     return embed;
// }
