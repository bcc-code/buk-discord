/* eslint-disable max-len */
import config from '../config';
import SanityClient from '@sanity/client';
import { GuildMember, TextChannel, MessageReaction, MessageEmbed } from 'discord.js';
import { client, guilds } from '..';
import Cache from 'node-cache';

class Sanity extends SanityClient {
    private moderativeRoles = ['owner', 'officer', 'captain'];
    private playerQuery = `{_id, name, discordId, dateRegistered, dateLastActive}`;
    private _cache = new Cache({
        stdTTL: 60,
    });

    async VerifyUser(member: GuildMember) {
        const date = new Date();

        date.setDate(date.getDate() - 1);
        // define query and parametres
        const query = `*[_type == "player" && discordId match $userid && dateLastActive > '${date.toISOString()}']`;
        const params = { userid: member.user.id };

        // fetch data from Sanity
        const result = (await this.fetch(query, params)) as Player[];

        // discord specific stuff
        const guild = member.guild;
        if (!guild) return console.log('GUILD NOT FOUND');

        if (!guilds[guild.id].config.verifyMembers) {
return console.log('VERIFICATION DISABLED');
}

        if (result.length > 0) {
            for (const player of result) {
                if (player?.discordId === member.user.id) {
                    // roles
                    const memberRole = guild.roles.cache.find(
                        (r) => r.name === 'Member',
                    );
                    if (memberRole) {
                        await member.roles.add(memberRole).catch((err) => console.log(err));
                        console.log('ADDED MEMBER ROLE');
                    } else {
                        console.log('MEMBER ROLE NOT FOUND');
                    }

                    // send messages
                    if (player.location) {
                        const church = guilds[guild.id].churches.find(
                            (c) => c.church === player.location.trim(),
                        );
                        const role = guilds[guild.id]?.roles.find((r) => r.name === church.nation && r.type === 'nation')?.role;

                        if (role) {
                            await member.roles.add(role);
                            console.log(`ADDED ROLE ${role.name}`);
                        } else {
                            const channel = guild.channels.cache.find(
                                (c) => c.name === 'admin' && c.type === 'text',
                            ) as TextChannel;
                            channel?.send(
                                `<@${member.id}> did not get its Role for church: ${player.location}`
                            );
                        }
                    } else {
                        const channel = guild.channels.cache.find(
                            (c) => c.name === 'admin' && c.type === 'text',
                        ) as TextChannel;
                        channel?.send(
                            `${member.displayName} does not have a church?`
                        );
                    }
                    this.patch(player._id)
                        .set({ discordIsConnected: true })
                        .commit()
                        .then(() => {
                            console.log(
                                `NEW USER CONNECTED ${player.nickname}`,
                            );
                        })
                        .catch((err) => {
                            console.log(`UPDATE FAILED ${err.message}`);
                        });


                    const welcomeEmbed = new MessageEmbed()
                        .setTitle('Welcome to the BUK Gaming Discord!')
                        .setDescription(`Go to <#${config.discord.messages?.find((m) => m.key == 'information')?.parentId}> to get specific gameroles and read information about the Discord server.`)
                        .addField('BUK', 'This is an Offical BUK server, we expect our members to respect the official guidelines from BUK Central.');
                    await member.send(welcomeEmbed).catch((err) => console.log(err));
                    console.log('SENT WELCOME EMBED');
                    return true;
                } else {
                    console.log(`ID: ${member.id} NOT FOUND IN DATABASE`);
                    return false;
                }
            }
        } else {
            const players = await sanity.fetch(`*[_type == 'player' && enableMoreDiscords == true && '${member.id}' in moreDiscordUsers[].discordId]`) as Player[];

            if (players.length > 0) {
                const player = players[0];
                const voucher = member.guild.members.cache.get(player.discordId);
                if (voucher?.id) {
                    await voucher.send('A member has joined the Discord on your behalf. Contact a Moderator if you do not know about this.');
                    await (member.guild.channels.cache.find((c) => c.name == 'admin' && c.type == 'text') as TextChannel)?.send(`<@${member.id}> was accepted as a secondary account of <@${voucher.id}>`);
                    // roles
                    const memberRole = guild.roles.cache.find(
                        (r) => r.name === 'Member',
                    );
                    if (memberRole) {
                        await member.roles.add(memberRole).catch((err) => console.log(err));
                        console.log('ADDED MEMBER ROLE');
                    } else {
                        console.log('MEMBER ROLE NOT FOUND');
                    }

                    // send messages
                    if (player.location) {
                        const church = guilds[guild.id].churches.find(
                            (c) => c.church === player.location.trim(),
                        );

                        const role = guilds[guild.id]?.roles.find((r) => r.name === church.nation && r.type === 'nation')?.role;
                        if (role) {
                            await member.roles.add(role);
                        } else {
                            const channel = guild.channels.cache.find(
                                (c) => c.name === 'admin' && c.type === 'text',
                            ) as TextChannel;
                            channel?.send(
                                `<@${member.id}> did not get its Role for church: ${player.location}`
                            );
                        }
                    } else {
                        const channel = guild.channels.cache.find(
                            (c) => c.name === 'admin' && c.type === 'text',
                        ) as TextChannel;
                        channel?.send(
                            `${member.displayName} does not have a church?`
                        );
                    }

                    return true;
                }
            } else {
                member.send(
                    `Hey, I couldn't find you on https://buk.gg. Make sure you connected the right account. \nIs the tag you find in your account at https://buk.gg/profile the same as **${member.user.tag}**?\nIf not, disconnect it and connect the correct account.\n\nIf you have any issues send a message to \`Through\` in the BUK Gaming Discord`,
                );
                member.roles.cache.forEach((role) => {
                    if (role.name !== '@everyone') {
                        member.roles.remove(role);
                    }
                });
                return false;
            }
        }
    }
    async RevokeMembership(member: GuildMember) {
        // define query and parametres
        const query = `*[_type == "player" && discordId match $userid]`;
        const params = { userid: member.user.id };

        // fetch data from Sanity
        const result = (await this.fetch(query, params)) as Player[];

        if (result.length > 0) {
            for (const p of result) {
                this.patch(p._id)
                    .set({discordIsConnected: false})
                    .commit()
                    .then(() => {
                        console.log('PATCHED');
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        }
    }
    async GetOrganizationsForMember(member: GuildMember) {
        if (this._cache.get(`orgs_${member.id}`)) {
            console.log('GETTING FROM CACHE');
            return this._cache.get(`orgs_${member.id}`) as Organization[];
        }
        const query = `*[_type == 'organization' && ($memberId in members[].player->discordId)]{..., "members": members[]{player->${this.playerQuery}, role}, "teams": teams[]{..., "game": game->, "members": members[]{player->${this.playerQuery}, captain}}}`;
        const params = {
            memberId: member.id,
        };
        const result = (await sanity.fetch(query, params)) as Organization[];
        console.log('NOT CACHE');
        this._cache.set(`orgs_${member.id}`, result);
        return result;
    }
    async AddMemberToOrganization(
        officer: GuildMember,
        newMember: GuildMember,
    ) {
        const query = `*[_type == 'organization' && ($officerId in members[role in $moderativeRoles].player->discordId)]{..., "members": members[]{player->${this.playerQuery}, role}}`;
        const params = {
            officerId: officer.id,
            moderativeRoles: this.moderativeRoles,
        };
        const orgs = (await sanity.fetch(query, params)) as Organization[];

        if (orgs.length === 0) return;
        let organization: Organization = orgs[0];
        if (orgs.length >= 2) {
            const msg = await officer.send('What team?');
            const acceptableReactions = ['🔵', '🔴'];

            const filter = (r: MessageReaction, u: GuildMember) => {
                return (
                    acceptableReactions.includes(r.emoji.name) &&
                    u.id !== client.user.id
                );
            };

            for (const emoji of acceptableReactions) {
                await msg.react(emoji);
            }
            const reactions = await msg.awaitReactions(filter, {
                max: 1,
                time: 10000,
            });
            console.log(reactions);
            const reaction = reactions.first();
            for (const i in orgs) {
                if (reaction.emoji.name === acceptableReactions[i]) {
                    organization = orgs[i];
                }
            }
        }
        const player = (await sanity.fetch(
            `*[_type == 'player' && discordId == '${newMember.id}']`,
        )[0]) as Player;
        if (!player) return;
        await sanity
            .patch(organization._id)
            .setIfMissing({ members: [] })
            .insert('after', 'members[-1]', [
                {
                    player: {
                        _ref: player._id,
                        _type: 'reference',
                    },
                    role: 'member',
                },
            ])
            .commit();
    }

    GetValidMembers() {
        const date = new Date();

        date.setMonth(date.getMonth() - 7);

        const query = `*[_type == 'player' && dateLastActive > '${date.toISOString()}']`;

        console.log(query);

        return sanity.fetch(query) as Promise<Player[]>;
    }

    GetInactiveMembers() {
        const date = new Date();

        date.setMonth(date.getMonth() - 7);

        const query = `*[_type == 'player' && discordIsConnected == true && dateLastActive < '${date.toISOString()}'].discordId`;

        console.log(query);

        return sanity.fetch(query) as Promise<string[]>;
    }

    async UpdateUser(member: GuildMember, player: Player) {
        if (player?._id) {
            const query = '*[_type == \'organization\' && count(members) > 20 && $playerId in members[].player._ref && defined(discordRoleId)]';
            const params = {
                playerId: player._id,
            };

            const organizations = await sanity.fetch(query, params) as Organization[];

            if (organizations?.length > 0) {
                organizations.forEach((org) => {
                    const role = member.guild.roles.cache.get(org.discordRoleId);
                    if (!member.roles.cache.get(role.id)) {
                        member.roles.add(role);
                    }
                });
            }
        }
    }

    GetTournament(slug: string) {
        const query = `*[_type == 'tournament' && (slug.current == $slug || _id == $slug)][0]{..., responsible->, 'soloPlayers': soloPlayers[]{'participant': player->, information}, 'teams': teams[]{information, 'participant': team->{..., captain->, organization->, players[]->}}}`;
        return sanity.fetch(query,
            {
                slug,
            },
        );
    }
}

const sanity = new Sanity({
    projectId: config.sanity.projectId,
    dataset: 'production',
    token: config.sanity.token,
    useCdn: false,
});

export default sanity;
