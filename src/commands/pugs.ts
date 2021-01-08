import { Message, TextChannel } from 'discord.js';

const players: {
    id: string;
    name: string;
    game: string;
}[] = [];

const enabledGames: { name: string; channel: string; size: number }[] = [
    {
        name: 'Overwatch',
        channel: 'overwatch',
        size: 6,
    },
    {
        name: 'VALORANT',
        channel: 'valorant',
        size: 5,
    },
    {
        name: 'League of Legends',
        channel: 'league-of-legends',
        size: 5,
    },
    {
        name: 'Counter Strike',
        channel: 'counter-strike',
        size: 5,
    },
];

export async function join(message: Message): Promise<void> {
    const channel = (message.channel as TextChannel) || null;
    const game = enabledGames.find((g) => g.channel === channel.name);
    if (!game) return;
    players.push({
        id: message.author.id,
        name: message.member.displayName,
        game: game.channel,
    });
}
