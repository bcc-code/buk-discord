// import Discord types
import { Message } from 'discord.js';

interface Config {
    debug: boolean;
    discord: {
        token: string;
        guildId: string;
        prefix: string;
        voice: {
            bitrate: number;
        };
        messages?: {
            id: string;
            key: string;
            parentId: string;
            message?: Message;
        }[];
    };
    sanity: {
        token: string;
        projectId: string;
    };
    express: {
        port: number;
        auth: {
            clientId: string;
            tokens: string[];
        };
    };
}

export interface Roles {
    churches: ({
        name: string;
        nation: string;
    } | null)[];
    nations: ({
        name: string;
        role: string;
        emoji?: string;
    } | null)[];
    games: ({
        name: string;
        shortname: string;
        role: string;
        emoji?: string;
    } | null)[];
}

const config: Config = {
    debug: process.argv[2] === 'debug',
    discord: {
        token: process.env.DISCORD_TOKEN,
        guildId: "551350238821220382",
        prefix: process.env.DISCORD_PREFIX,
        voice: {
            bitrate: parseInt(process.env.DISCORD_BITRATE) ?? 96000,
        },
        messages: [
            {
                id: "642052008194605066",
                key: "voice",
                parentId: "641251371588517898"
            },
            {
                id: "640888269869154314",
                key: "information",
                parentId: "640884796595109888"
            },
            {
                id: "641751766307831808",
                key: "games",
                parentId: "640884796595109888"
            }
        ]
    },
    sanity: {
        projectId: "u94uo5n2",
        token: process.env.SANITY_TOKEN,
    },
    express: {
        port: 3030,
        auth: {
            clientId: "C9VYzeIke7",
            tokens: JSON.parse(process.env.EXPRESS_TOKENS) as string[]
        }
    }
}

export default config;
