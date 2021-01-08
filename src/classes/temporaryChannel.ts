import {
    VoiceChannel,
    GuildMember,
    TextChannel,
    OverwriteResolvable,
    Role,
} from 'discord.js';
import { channels, client, guilds } from '..';
import { existsSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import Guild from './guild';

const whitelist = ["551351643854209035", "559828650338418689"]

/** A Temporary Voice Channel with advanced functions. */
class TemporaryChannel {
    creator: GuildMember;
    channel: VoiceChannel;
    textChannel: TextChannel;
    guild: Guild;
    modes: {
        locked: boolean;
        closed: boolean;
        hidden: boolean;
        muted: boolean;
        organization: boolean;
    };
    constructor(channel: VoiceChannel, creator: GuildMember, cache?: boolean) {
        this.creator = creator;
        this.channel = channel;
        this.guild = guilds[channel.guild.id];
        this.modes = {
            locked: false,
            closed: false,
            hidden: false,
            muted: false,
            organization: false,
        };
        if (cache) {
            this.getFromCache(creator);
        }
    }
    async reset(member: GuildMember): Promise<void> {
        const channel = this.channel;
        if (channel.permissionsFor(member)?.has('MANAGE_CHANNELS')) {
            Object.keys(this.modes).forEach((mode) => {
                this.modes[mode] = false;
            });

            await channel.lockPermissions();

            await channel.createOverwrite(this.creator, {
                MANAGE_CHANNELS: true,
                MOVE_MEMBERS: true,
                CONNECT: true,
                VIEW_CHANNEL: true,
            });
        }
    }
    async mute(member: GuildMember): Promise<void> {
        const channel = this.channel;
        if (!channel.permissionsFor(member)?.has('MANAGE_CHANNELS')) return;
        await channel.createOverwrite(channel.guild.roles.everyone, {
            SPEAK: this.modes.muted ? null : false,
        });

        this.modes.muted = !this.modes.muted;

        const msg = await member.send(
            `Your channel is **${this.modes.muted ? 'MUTED' : 'UNMUTED'}**`
        );
        await msg.delete({ timeout: 20000 });
    }
    async lock(member: GuildMember): Promise<void> {
        const channel = this.channel;

        if (
            channel.permissionsFor(member)?.has('MANAGE_CHANNELS') &&
            !this.modes.locked
        ) {
            await channel.lockPermissions();

            channel.createOverwrite(channel.guild.roles.everyone, {
                CONNECT: false,
            });
            channel.createOverwrite(this.creator, {
                MOVE_MEMBERS: true,
                MANAGE_CHANNELS: true,
                VIEW_CHANNEL: true,
                CONNECT: true,
            });

            this.modes.locked = true;
            this.modes.closed = false;

            const msg = await member.send(
                'Your channel is now "fully" private.'
            );
            msg.delete({ timeout: 20000 });
        }
    }
    async close(member: GuildMember): Promise<void> {
        const channel = this.channel;
        if (channel.permissionsFor(member)?.has('MANAGE_CHANNELS')) {
            this.modes.closed = !this.modes.closed;
            if (this.modes.closed) {
                channel.createOverwrite(channel.guild.roles.everyone, {
                    CONNECT: false,
                });
                channel.members.forEach((memb) => {
                    if (channel.permissionsFor(memb).has('MANAGE_CHANNELS')) {
                        channel.createOverwrite(memb, {
                            VIEW_CHANNEL: true,
                            CONNECT: true,
                            MOVE_MEMBERS: true,
                            MANAGE_CHANNELS: true,
                        });
                    } else {
                        channel.createOverwrite(memb, {
                            VIEW_CHANNEL: true,
                            CONNECT: true,
                        });
                    }
                });
                member.send(
                    'Current members have been granted exclusive access. Members who are dragged in will also be able to rejoin.'
                );
            } else {
                member.send('No longer giving perms to joining members.');
            }
        }
    }
    async hide(member: GuildMember): Promise<void> {
        const channel = this.channel;
        if (channel.permissionsFor(member)?.has('MANAGE_CHANNELS')) {
            this.modes.hidden = true;
            await channel.createOverwrite(channel.guild.roles.everyone, {
                VIEW_CHANNEL: false,
            });
            if (channel.parent.name !== 'Voice') {
                const role = member.guild.roles.cache.find(
                    (r) => r.name === channel.parent.name
                );
                if (!role) return;
                await channel.createOverwrite(role, {
                    VIEW_CHANNEL: false,
                });
            }
        }
    }
    async text(member: GuildMember): Promise<void> {
        const channel = this.channel;
        if (channel.permissionsFor(member)?.has('MANAGE_CHANNELS')) {
            if (
                this.textChannel || existsSync(`./data/tempTextChannels/${this.channel.id}`)
            ) {
                member.guild.channels.cache.get(this.textChannel.id)?.delete();
                this.textChannel = null;
                unlinkSync(`./data/tempTextChannels/${this.channel.id}`);
                return;
            }
            const permissionOverwrites: OverwriteResolvable[] = [
                {
                    id: member.guild.roles.cache.find(
                        (r) => r.name === 'BUK Gaming'
                    ),
                    allow: ['VIEW_CHANNEL'],
                },
                {
                    id: member.guild.roles.everyone,
                    deny: ['VIEW_CHANNEL'],
                },
                {
                    id: member,
                    allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL'],
                },
            ];
            channel.members.forEach((memb) => {
                if (memb.id === member.id) return;
                permissionOverwrites.push({
                    id: memb,
                    allow: ['VIEW_CHANNEL'],
                });
            });

            const textChannel = await member.guild.channels.create(
                channel.name,
                {
                    parent: channel.parent,
                    type: 'text',
                    permissionOverwrites,
                }
            );
            this.textChannel = textChannel;
            member.send(
                'A temporary text channel has been created. It will be deleted when your channel is emptied.'
            );
            writeFileSync(`./data/tempTextChannels/${this.channel.id}`, textChannel.id);
        }
    }

    async organization(member: GuildMember): Promise<void> {

        const organizationRoles: Role[] = [];
        const roles = guilds[member.guild.id].roles.filter(r => r.type === 'organization' && member.roles.cache.find(role => role.id == r.id) !== undefined);

        for (const role of roles) {
            organizationRoles.push(role.role);
        }

        if (organizationRoles.length == 0) {
            await member.send("You don't have any eligible organization roles to use this feature.");
            return;
        }
        
        const channel = this.channel;

        for (const [, overwrite] of channel.permissionOverwrites) {
            if (whitelist.includes(overwrite.id)) {
                organizationRoles.push(member.guild.roles.cache.get(overwrite.id));
            }
        }

        if (channel.permissionsFor(member)?.has('MANAGE_CHANNELS')) {
            const overwrites: OverwriteResolvable[] = [];

            overwrites.push({
                id: channel.guild.roles.everyone.id,
                deny: ["CONNECT", "VIEW_CHANNEL"]
            });

            channel.members.forEach((memb) => {
                if (channel.permissionsFor(memb).has('MANAGE_CHANNELS')) {
                    overwrites.push({
                        id: memb.id,
                        allow: ["VIEW_CHANNEL", "CONNECT", "MOVE_MEMBERS", "MANAGE_CHANNELS"]
                    })
                }
            });
            organizationRoles.forEach((role) => {
                overwrites.push({
                    id: role.id,
                    allow: ["CONNECT", "VIEW_CHANNEL"]
                })
            })

            await channel.overwritePermissions(overwrites);

            await member.send(
                'Only members of your organizations can join the channel.'
            );
        }
    }

    async getFromCache(creator: GuildMember): Promise<void> {
        if (existsSync(`./data/tempTextChannels/${this.channel.id}`)) {
            const textchannel = readFileSync(`./data/tempTextChannels/${this.channel.id}`, 'string');
            if (textchannel) {
                this.textChannel = client.channels.cache.get(
                    textchannel
                ) as TextChannel;
                const permissionOverwrites: OverwriteResolvable[] = [
                    {
                        id: creator.guild.roles.cache.find(
                            (r) => r.name === 'BUK Gaming'
                        ),
                        allow: ['VIEW_CHANNEL'],
                    },
                    {
                        id: creator.guild.roles.everyone,
                        deny: ['VIEW_CHANNEL'],
                    },
                    {
                        id: creator,
                        allow: ['MANAGE_CHANNELS', 'VIEW_CHANNEL'],
                    },
                ];
                this.channel.members.forEach((memb) => {
                    if (memb.id === creator.id) return;
                    permissionOverwrites.push({
                        id: memb,
                        allow: ['VIEW_CHANNEL'],
                    });
                });
                this.textChannel.overwritePermissions(permissionOverwrites);
            }
        }
    }
    async delete(): Promise<void> {
        const id = this.channel.id;
        if (existsSync(`./data/tempTextChannels/${id}`)) {
            const textchannel = readFileSync(`./data/tempTextChannels/${id}`, {
                encoding: 'utf8'
            });
            console.log(textchannel);
            if (textchannel) {
                client.channels.cache.get(textchannel)?.delete();
            }
            unlinkSync(`./data/tempTextChannels/${id}`)
        }
        delete channels[id];
    }
}

export default TemporaryChannel;
