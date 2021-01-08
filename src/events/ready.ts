import { TextChannel } from 'discord.js';
import { client, guilds } from '../index';
import config from '../config';
import express from '../express';
import Guild from '../classes/guild';
// import { connection } from "../index";
// import * as ow from "../leaderboard/overwatch";

export default async () :Promise<void> =>  {
    const now = new Date().toISOString();
    console.log(`${now}\n${client.user.username} is now online`);
    if (config.debug) {
        client.user.setActivity('nothing');
    } else {
        client.user.setActivity('!help', { type: 'LISTENING' });
    }

    const guild =
        client.guilds.cache.get(config.discord?.guildId) ||
        client.guilds.cache.first();

    for (const [, g] of client.guilds.cache) {
        guilds[g.id] = new Guild(g);
        await guilds[g.id].initialize();
        await new Promise(resolve => {
            setTimeout(resolve, 2000);
        });
    }

    // const messages = await data.config.get('messages') || null;
    // if (!messages) {
    //     await data.config.set('messages', config.discord.messages);
    //     console.log("UPDATING MESSAGES");
    // } else {
    //     config.discord.messages = messages;
    // }

    // cron.schedule("0 0 */2 * * *", async () => {
    //     const msg = await guild.channels.cache.find(c => c.name === "calendar").messages.fetch(conf.calendarmsg);
    //     if (msg) schedule(msg);
    // });
    // connection.connect();
    (guild.channels.cache.find((c) => c.name === 'admin') as TextChannel).send(
        `Bot started.${config.debug ? ' _DEBUG_' : ''}`
    );


    // const orgs = await sanity.fetch("*[_type == 'organization']{..., 'members': members[]{player->}}") as Organization[];
    // const teams = await sanity.fetch("*[_type == 'team']{..., 'players': players[]->}") as Team[];

    // const illegalMembers = [];
    // const illegalTeamMembers = [];

    // orgs.forEach(org => {
    //     org.members?.forEach(member => {
    //         if (member?.player?.discordIsConnected != true) {
    //             illegalMembers.push({org: org.name, member: member.player.name});
    //         }
    //     });
    // });

    // teams.forEach(team => {
    //     team.players?.forEach(player => {
    //         if (player.discordIsConnected != true) {
    //             illegalTeamMembers.push({team: team.name, player: player.name});
    //         }
    //     })
    // })

    // CODE FOR SYNCING DISCORDTAGS

    // const players = await sanity.fetch("*[_type == 'player' && defined(discordId) && defined(discordUser) && discordIsConnected]") as Player[];
    // const members = guild.members.cache;

    // for (const player of players) {
    //     const member = members.find(m => m.id == player.discordId);
    //     if (member) {
    //         if (`${member.user.username}#${member.user.discriminator}` !== player.discordUser) {
    //             console.log(`${member.user.username}#${member.user.discriminator}`, player.discordUser);
    //             await sanity.patch(player._id)
    //                 .set({discordUser: `${member.user.username}#${member.user.discriminator}`})
    //                 .commit()
    //                 .then((val) => console.log(val._id, player.name))
    //                 .catch((err) => console.log(err));
                
    //             await new Promise(resolve => setTimeout(resolve, 200));
    //         }
    //     }
    // }

    // SYNC ALL PLAYERS WITH NO ORG ROLE

    // const orgs = await sanity.fetch("*[_type == 'organization' && count(members) >= 20]{'members': members[].player->discordId, discordRoleId}") as {discordRoleId: string, members: string[]}[]

    // for (const org of orgs) {
    //     const role = guild.roles.cache.get(org.discordRoleId);
    //     if (!role) continue;
    //     for (const memberId of org.members) {
    //         //console.log("MEMBER", memberId)
    //         const member = guild.members.cache.get(memberId);
    //         if (member?.roles.cache.get(role.id)) continue;
    //         await member?.roles.add(role);
    //         await new Promise(resolve => setTimeout(resolve, 200))
    //     }
    // }
    // console.log("done")

    // // SYNC ALL PLAYERS WITH NO GAME ROLE
    // const teams = await sanity.fetch("*[_type == 'team']{'role': game->discordRoleId, 'captain': captain->discordId, 'players': players[]->discordId}") as [{
    //     role: string,
    //     captain: string,
    //     players: string[],
    // }];

    // let i = 0;

    // for (const team of teams) {
    //     i++;
    //     // console.log(`TEAMS #${i}`);
    //     const role = guild.roles.cache.get(team.role);
    //     if (!role) continue;
    //     const captain = guild.members.cache.get(team.captain);
    //     if (!captain?.roles.cache.get(role.id)) {
    //         await captain?.roles.add(role);
    //         await new Promise(resolve => setTimeout(resolve, 400));
    //     }
    //     if (team.players?.length > 0) {
    //         let y = 0;
    //         for (const player of team.players) {
    //             y++;
    //             // console.log(`PLAYER #${y}`);
    //             const member = guild.members.cache.get(player);
    //             if (member?.roles.cache.get(role.id)) continue;
    //             await member?.roles.add(role);
    //             if (!member) {
    //                 console.log('NOT CONNECTED TO DISCORD ' + player);
    //             }
    //             await new Promise(resolve => setTimeout(resolve, 1000));
    //         }
    //     }
    // }
    // console.log("SYNCED PLAYERS")

    // const result = await sanity.fetch("*[_type == 'player']");

    // console.log(result.length);
    
    //writeFileSync(`./data/guilds/${guild.id}.json`, JSON.stringify(await data.guilds.get(guild.id) || {}))'

    express();
};
