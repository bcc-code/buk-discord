import { Message, MessageEmbed } from 'discord.js';
import config from '../config';
import { channels } from '..';
import CommandObject from '../classes/command';
import { existsSync, readdirSync, readFileSync } from 'fs';

function secondsToHms(d: number) {
    const days = Math.floor(d / 3600 / 24);
    const h = Math.floor(d / 3600 % 24);
    const m = Math.floor(d % 3600 / 60);

    const dDisplay = days > 0 ? days + (days == 1 ? " day, " : " days, ") : "";
    const hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
    return dDisplay + hDisplay + mDisplay; 
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

    top = async (message: Message, args: string[]) => {
        
        const members: {
            id: string;
            time: number;
        }[] = [];
        readdirSync('./data/voice_activity').forEach(d => {
            const m = {
                id: d,
                time: parseInt(readFileSync('./data/voice_activity/' + d, {encoding: 'utf8'})),
            };
            members.push(m);
        });

        const embed = new MessageEmbed()
            .setTitle(`LEADERBOARD ACTIVITY`)
            .setDescription(`Top 10`);
        
        const top = members.sort((a, b) => b.time - a.time).slice(0, 10);

        for (const m of top) {
            //embed.addField(`<@${m.id}>`, `${secondsToHms(Math.floor(m.time/1000)) ?? `UNKNOWN`}`, true);
            embed.addField(`#${top.indexOf(m) + 1}`, `<@${m.id}>\n_${secondsToHms(Math.floor(m.time/1000))}_`, true);
        }

        await message.channel.send(embed);

        return true;
    }

    activity = async (message: Message, args: string[]) => {
        const member = message.mentions.members.first   ();

        if(!member) {
            return false;
        }

        const path = './data/voice_activity/' + member.id;
        const activity = existsSync(path) ? parseInt(readFileSync(path, {encoding: 'utf8'})) : undefined;

        if (activity) {
            await message.channel.send(`<@${member.id}> has been active for ${secondsToHms(Math.floor(activity/1000))}`);
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
