import { client, directMessages, guilds } from '../index';
import sanity from '../classes/sanity';
import config from '../config';
import CacheService from '../classes/cache';
import { GuildMember } from 'discord.js';

interface Functions {
    [key: string]: (
        data: string
    ) => Promise<{ status: boolean; response: string | unknown }>;
}

class DiscordMember {
    public json: unknown;

    constructor(member: GuildMember) {
        const rolesArray = [];
        member.roles.cache.forEach((role) => {
            if (['@everyone'].includes(role.name)) return;
            rolesArray.push({
                id: role.id,
                name: role.name,
            });
        });
        const created = new Date(member.user.createdTimestamp);
        this.json = {
            id: member.id,
            username: member.user.username,
            tag: member.user.tag,
            bot: member.user.bot,
            discriminator: member.user.discriminator,
            displayName: member.displayName,
            roles: rolesArray,
            avatar: member.user.avatarURL(),
            created: `${created.getDate()}-${created.getMonth()}-${created.getFullYear()}`,
        }
    }
}

export const postFunctions: Functions = {};

const cache = new CacheService(300);

class ApiFunctions {
    desc = [
        {
            type: 'Get',
            desc: 'Get Member by ID\n123456789012345678',
        },
        {
            type: 'Update',
            desc:
                'Update roles for SanityPlayerId\n/00000000-0000-0000-0000-000000000000',
        },
        {
            type: 'Verify',
            desc: 'Give MemberID the Member role\n123456789012345678',
        },
        {
            type: 'AddRole',
            desc:
                'Give MemberID the RoleID\n123456789012345678&123456789012345678',
        },
    ];
    /**
     * Get Member by ID
     * @param userId string
     */
    async Get(userId: string) {
        const guild =
            client.guilds.cache.get(config.discord.guildId) ||
            client.guilds.cache.first();
        const member = guild?.members.cache.get(userId) ? await guild.members.fetch(userId) : null;
        if (member) {
            
            return {
                status: true,
                response: new DiscordMember(member).json,
                // response: {
                //     username: member.user.username,
                //     displayName: member.displayName,
                //     userId: member.id,
                //     rolesArray,
                // },
            };
        }
        return {
            status: false,
            response: null,
        };
    }
    
    async IsConnected(userId: string) {
        const guild =
            client.guilds.cache.get(config.discord.guildId) ||
            client.guilds.cache.first();
        const member = guild?.members.cache.get(userId) ? await guild.members.fetch(userId) : null;
        if (member) {
            setTimeout(() => {if (!member.roles.cache.find(r => r.name === "Member")) sanity.VerifyUser(member)}, 10000);
            return {
                status: true,
                response: new DiscordMember(member).json,
                // response: {
                //     username: member.user.username,
                //     displayName: member.displayName,
                //     userId: member.id,
                //     rolesArray,
                // },
            };
        }
        return {
            status: false,
            response: null,
        };
    }
    
    /**
     * Update Locations for Member by ID
     * @param playerid string
     */
    async Update(player: Player) {
        if (player._id == null)
            return {
                status: false,
                response: {
                    _id: null,
                },
            };
        const guild = client.guilds.cache.get(config.discord.guildId);
        const member = guild.members.cache.get(player?.discordId);
        if (!member || !player)
            return {
                status: false,
                response: {
                    _id: null,
                },
            };
        const nation = guilds[guild.id].roles.find(
            (n) =>
                n.name ===
                guilds[guild.id].churches.find((c) => c.church === player.location)?.nation
                && n.type === "nation"
        );
        const nationRole = nation.role;
        member.roles.cache.forEach((role) => {
            if (guilds[guild.id].roles.find((n) => n.id === role?.id && n.type === "nation")) {
                if (role?.id !== nationRole?.id) member.roles.remove(role);
            }
        });
        await sanity.UpdateUser(member, player);
        if (nationRole) {
            await member.roles.add(nationRole);
            return {
                status: true,
                response: new DiscordMember(member).json,
            };
        }
        return {
            status: false,
            response: {
                _id: null,
            },
        };
    }
    /**
     * Set user to Member
     * @param userid string
     */
    async Verify(userid: string) {
        const guild =
            client.guilds.cache.get(config.discord.guildId) ||
            client.guilds.cache.first();
        const member = guild?.members.cache.get(userid) ? await guild.members.fetch(userid) : null;
        if (!member)
            return {
                status: false,
                response: 'MEMBER NOT FOUND',
            };
        if (member.roles.cache.find((r) => r.name === 'Member'))
            return {
                status: false,
                response: 'MEMBER ALREADY HAS ROLE',
            };
        const role = guild.roles.cache.find((r) => r.name === 'Member');
        if (role) {
            await member.roles.add(role);
            return {
                status: true,
                response: `ROLE ADDED TO MEMBER: ${member.displayName}`,
            };
        }
        return {
            status: false,
            response: `Something failed`,
        };
    }
    /**
     * Add RoleID to MemberID
     * @param params string
     */
    async AddRole(params: string) {
        const guild =
            client.guilds.cache.get(config.discord.guildId) ||
            client.guilds.cache.first();
        const data = params.split('&');
        const member = guild?.members.cache.get(data[0]) ? await guild.members.fetch(data[0]) : null;
        const role = await guild?.roles.fetch(data[1]);
        if (role) {
            if (member?.roles.cache.find((r) => r.name === role.name))
                return {
                    status: false,
                    response: 'MEMBER ALREADY HAS ROLE',
                };
            await member?.roles.add(role);
            return {
                status: true,
                response: 'ADDED ROLE TO MEMBER',
            };
        }
        return {
            status: false,
            response: 'SOMETHING FAILED',
        };
    }

    async Search(searchString: string) {
        const guild =
            client.guilds.cache.get(config.discord.guildId) ||
            client.guilds.cache.first();

        const memberRole = guild.roles.cache.find(m => m.name === "Member");
        console.log(memberRole?.name);
        if (!memberRole) return {
            status: false,
            response: null,
        }

        searchString = searchString.toLowerCase();
        
        const members = guild.members.cache.filter((m) => m.roles.cache.get(memberRole.id) && (m?.id == searchString || m.nickname?.toLowerCase().includes(searchString) || m.displayName?.toLowerCase().includes(searchString) || `${m.user?.username}#${m.user?.discriminator}`?.toLowerCase().includes(searchString))).array();

        if (members.length > 10 || members.length == 0) {
            return {
                status: false,
                response: null,
            }
        }

        return {
            status: true,
            response: JSON.stringify(members),
        }
    }
    async GetDms() {
        return {
            status: true,
            response: JSON.stringify(directMessages),
        };
    }
}

const apiFunctions = new ApiFunctions();
export default apiFunctions;

export async function getInformation(): Promise<string> {
    const infomsg = await cache.get('infoMsg', () => {
        return sanity.fetch(
            "*[_type == 'localizationBlock' && code.current == 'discord.information']"
        );
    });
    return infomsg;
}
