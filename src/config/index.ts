import config from './config.json';

// import Discord types
import { Message } from 'discord.js';

export interface Config {
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
    database: {
        user: string;
        password: string;
        address: string;
        name: string;
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

export default config as Config;
