interface Player {
    _id: string;
    email: string;
    personKey?: string;
    displayName?: string;
    name: string;
    nickname: string;
    location?: string;
    discordUser?: string;
    discordId: string;
    discordIsConnected: boolean;
    moreDiscordUsers: {
        _key: string;
        name: string;
        discordId: string;
    }[];
    image?: string;
    dateRegistered?: Date;
    dateLastActive?: Date;
    isRegistered?: boolean;
    agreeToPrivacyPolicy?: boolean;
    phoneNumber: string;
}

interface Organization {
    _id: string;
    name: string;
    members?: {
        player: Player;
        role: 'owner' | 'officer' | 'captain' | 'member';
    }[];
    discordRoleId: string;
}

interface Game {
    name: string;
}

interface Team {
    _id: string;
    name: string;
    game: Game;
    captain: Player;
    players: Player[];
    organization: Organization;
}

interface Tournament {
    id: string;
    slug: string;
    title: { en: string; no: string; };
    introduction: string;
    responsible: Player;
    categoryIds: string[];
    body: string;
    logo: string;
    mainImage: string;
    toornamentId: string;
    registrationForm: string;
    registrationOpen: boolean;
    telegramLink: string;
    liveStream: string;
    liveChat: boolean;
    game: Game;
    signupType: string;
    requiredInformation: string[];
    teamSize: {
        max: number;
        min: number;
    };
    teams: Participant<Team>[];
    soloPlayers: Participant<Player>[];
    winner: string;
    contacts: {
        _key: string;
        name: string;
        email: string;
        discord: string;
        phoneNumber: string;
    };
}

interface Participant<T> {
    information: string[];
    participant: T;
}

interface SanityGuild {
    _id: string;
    name: string;
    guildId: string;
    channels: {
        _key: string;
        name: string;
        id: string;
    }[];
    gameRoles: GameRole[];
    nationRoles: NationRole[];
    communityRoles: {
        name: string;
        emojiName: string;
        roleId: string;
    }[];
    churches: Church[];
    organizationRoles: string[];
}

interface GameRole {
    _key: string;
    game: {
        _type: "reference";
        _ref: string;
    },
    emojiName: string;
    shortName: string;
    roleId: string;
}

interface NationRole {
    _key: string;
    name: string;
    code: string;
    roleId: string;
}

interface Church {
    _key: string;
    church: string;
    nation: string;
}