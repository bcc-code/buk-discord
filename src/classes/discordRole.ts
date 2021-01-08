import { Role } from "discord.js";

type RoleType = "nation" | "game" | "organization" | "community";

export class DiscordRole {
    public id: string;
    public name: string;
    public readonly role: Role;
    public readonly type: RoleType;
    public key: string;

    constructor (type: RoleType, discordRole: Role, key?: string)
    {
        this.role = discordRole;
        this.id = discordRole?.id;
        this.name = discordRole?.name;
        this.type = type;

        this.key = key;
    }
}