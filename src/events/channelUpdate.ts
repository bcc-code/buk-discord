import { VoiceChannel } from 'discord.js';
import { channels } from '..';

export default async (oldChannel: VoiceChannel, newChannel: VoiceChannel): Promise<void> => {
    if (oldChannel.type !== 'GUILD_VOICE') return;
    if (oldChannel?.name !== newChannel?.name) {
        if (newChannel.name === 'Create Channel') {
            await newChannel.setName(oldChannel.name);
        }
    }
    if (oldChannel.parentId !== newChannel.parentId) {
        const member = channels[newChannel.id].creator;
        
        const channel = newChannel;
        
        channels[channel.id].reset(member);
    }
};
