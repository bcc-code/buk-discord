import { VoiceChannel, VoiceState, GuildMember } from 'discord.js';
import config from '../config';
import fs from 'fs';
import { channels, guilds, client } from '..';
import channelNames from '../config/channelNames';
import TemporaryChannel from '../classes/temporaryChannel';

const rootFolder = './data/voice_activity';

if (!fs.existsSync(rootFolder)) {
    fs.mkdirSync(rootFolder);
}

async function deleteOverwrite(
    channel: VoiceChannel,
    member: GuildMember,
    ms: number,
) {
    await new Promise((resolve) => setTimeout(resolve, ms));
    channel.permissionOverwrites.get(member.id)?.delete();
    return;
}

function randomString() {
    const number = Math.floor(Math.random() * channelNames.length);
    return channelNames[number];
}

function groupEnd(name: string) {
    const number = Math.floor(Math.random() * 20);
    switch(number) {
        case 0:
            return `${name}'s hive`;
        case 1:
            return `${name}'s group`;
        case 2:
            return `${name}'s gang`;
        case 3:
            return `Property of ${name}`;
        case 4:
            return `The ${name}`;
        case 5:
            return randomString();
        case 6:
            return `${name}'s party`;
        case 7:
            return `Tea time with ${name}`;
        case 8:
            return `Count ${name}'s Castle`;
        default:
            return `${name}'s channel`;
    }
}

type VoiceActivityStat = { id: string; total: number; started: number }

const voiceStats: {
    [id: string]: VoiceActivityStat
} = {

}

function getTime(id: string): number {
    if (fs.existsSync(`${rootFolder}/${id}`)) {
        return parseInt(fs.readFileSync(`${rootFolder}/${id}`, {encoding: 'utf8'}));
    }
    return 0;
}
function setTime(id: string, time: number) {
    fs.writeFileSync(`${rootFolder}/${id}`, time);
}

function updateTimeForUser(member: GuildMember) {
    const now = Date.now();
    if (member.voice.channel && member.voice.channel?.name !== 'AFK') {
        let stats = voiceStats[member.id];
        if (stats) {
            stats.total = stats.total + (now - stats.started);
        } else {
            stats = {
                id: member.id,
                started: now,
                total: 0,
            }
            stats.total = getTime(member.id);
        }
        voiceStats[member.id] = stats;
        setTime(member.id, stats.total);
    } else {
        const stats = voiceStats[member.id];
        if (stats) {
            stats.total = stats.total + (now - stats.started);
            voiceStats[member.id] = stats;
            setTime(member.id, stats.total);
        }
        delete voiceStats[member.id];
    }
}

export default async (oldState: VoiceState, newState: VoiceState): Promise<void> => {
    const member = newState.member;
    updateTimeForUser(member);
    if (config.debug) return console.log('DEBUG: TRUE | VOICE IGNORED');
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;
    if (!guilds[member.guild.id]?.config.voice) return;

    if (oldChannel) {
        const perms = oldChannel.parent.permissionsFor(client.user);
        if (!perms.has('MANAGE_CHANNELS')) return;
        const cc = oldChannel.name === 'Create Channel';
        const lc = oldChannel.name === 'Lobby';

        if (channels[oldChannel.id]?.creator.id !== member.id)
            channels[oldChannel.id]?.textChannel?.permissionOverwrites
                .get(member.id)
                ?.delete();

        if (
            oldChannel.parent.name !== 'Permanent' &&
            !oldChannel.members.array().length &&
            !cc &&
            !lc
        ) {
            setTimeout(() => {
                if (
                    oldChannel.guild.channels.cache.get(oldChannel.id)
                        ? !oldChannel.members.array().length
                        : false
                ) {
                    oldChannel
                        .permissionsFor(client.user)
                        .has('MANAGE_CHANNELS')
                        ? oldChannel?.delete()
                        : console.log('NO PERMISSION');
                    channels[oldChannel.id]?.delete() ||
                        new TemporaryChannel(oldChannel, member).delete();
                }
            }, 5000);
        }
    }

    if (newChannel) {
        const perms = newChannel.parent.permissionsFor(client.user);
        if (!perms.has('MANAGE_CHANNELS')) return;
        if (!perms.has('MOVE_MEMBERS')) return;
        if (newChannel.name === 'Create Channel') {
            const category = newChannel.parent;
            const groupName =
                member.displayName.length > 10
                    ? groupEnd(member.user.username)
                    : groupEnd(member.displayName);

            const bitrate =
                newChannel.guild.premiumSubscriptionCount >= 15
                    ? 256000
                    : newChannel.guild.premiumSubscriptionCount >= 2
                    ? 128000
                    : 96000;

            const createdChannel = await newChannel.guild.channels.create(
                groupName,
                {
                    parent: category,
                    type: 'voice',
                    bitrate,
                }
            );
            createdChannel.createOverwrite(member, {
                MOVE_MEMBERS: true,
                MANAGE_CHANNELS: true,
                CONNECT: true,
                VIEW_CHANNEL: true,
            });
            if (member.voice.channel) {
                await member.voice.setChannel(createdChannel);
                await newChannel.createOverwrite(member, {
                    CONNECT: false,
                });
                deleteOverwrite(newChannel, member, 10000);
            }
            channels[createdChannel.id] = new TemporaryChannel(
                createdChannel,
                member
            );
            setTimeout(() => {
                if (
                    !createdChannel.guild.channels.cache
                        .get(createdChannel.id)
                        ?.members.array().length
                ) {
                    createdChannel.guild.channels.cache
                        .get(createdChannel.id)
                        ?.delete();
                    const channelSettings = channels[createdChannel.id];
                    if (channelSettings) {
                        channelSettings.textChannel?.delete();
                        delete channels[createdChannel.id];
                    }
                }
            }, 60000);
        } else {
            if (channels[newChannel.id]?.creator?.id === member.id) {
                return;
            } else {
                if (channels[newChannel.id]?.modes.closed) {
                    newChannel.createOverwrite(member, {
                        VIEW_CHANNEL: true,
                        CONNECT: true,
                    });
                }
                channels[newChannel.id]?.textChannel?.createOverwrite(member, {
                    VIEW_CHANNEL: true,
                });
            }
        }
    }
};
