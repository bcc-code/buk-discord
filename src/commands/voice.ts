import { Message } from 'discord.js';
import config from '../config';
import { channels } from '..';
import CommandObject from '../classes/command';
import { existsSync, readFileSync } from 'fs';

function secondsToHms(d) {
    d = Number(d);
    const h = Math.floor(d / 3600);
    const m = Math.floor(d % 3600 / 60);
    const s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay; 
}

class VoiceCommands extends CommandObject {
    // functions: string[] = ['voice', 'add', 'channel'];
    voice = async (message: Message, args: string[]) => {
        const cmd = args[0];
        args = args?.splice(1);
        const createdChannel = channels[message.member.voice.channel.id];

        const cmds = ['lock', 'close', 'hide', 'reset', 'text', 'organization', 'mute', 'country'];
        if (!cmds.includes(cmd)) {
            const msg = await message.channel.send(
                `Available subcommands: ${cmds.join(', ')}`
            );
            msg.delete({ timeout: 5000 });
            return true;
        }
        createdChannel?.[cmd]?.(message.member);
        return true;
    };

    play = async (message: Message) => {
        const chan = message.member.voice.channel;

        if (!chan) {
            const msg = await message.channel.send(
                'You are not in a voice channel.'
            );
            msg.delete({ timeout: 5000 });
            return false;
        }

        //connection.play(`/default.mp3`);
        return true;
    };

    channel = this.voice;

    activity = async (message: Message, args: string[]) => {
        const member = message.mentions.members.first();

        if(!member) {
            return false;
        }

        const path = './data/voice_activity/' + member.id;
        const activity = existsSync(path) ? parseInt(readFileSync(path, {encoding: 'utf8'})) : undefined;

        if (activity) {
            await message.channel.send(`<@${member.id}> has been active for ${secondsToHms(activity/1000)}`);
        }

        return true;
    }

    add = async (message: Message, args: string[]) => {
        const chan = message.member.voice.channel;

        if (!chan) {
            const msg = await message.channel.send(
                'You are not in a voice channel.'
            );
            msg.delete({ timeout: 5000 });
            return false;
        }

        const player = message.mentions.members.first();
        console.log(player.id, args[0].replace(/[<>@!]/g, ''));

        if (!player) {
            const msg = await message.channel.send(
                `Usage: ${config.discord.prefix}add [@player]`
            );
            msg.delete({ timeout: 5000 });
            return false;
        }
        if (chan.permissionsFor(message.member).has('MANAGE_CHANNELS')) {
            chan.createOverwrite(player, {
                VIEW_CHANNEL: true,
                CONNECT: true,
            });
            const msg = await message.channel.send('Player added.');
            msg.delete({ timeout: 5000 });
        } else {
            const msg = await message.channel.send(
                'You do not have access to edit this channel.'
            );
            msg.delete({ timeout: 10000 });
        }
        return true;
    };
}

const voiceCommands = new VoiceCommands();

export default voiceCommands;
