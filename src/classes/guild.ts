/* eslint-disable @typescript-eslint/no-var-requires */
import { guilds, client } from '..';
import {
    TextChannel,
    Guild as GuildClass,
    MessageEmbed,
    Message,
} from 'discord.js';
import { existsSync, writeFileSync, unlinkSync, readFileSync } from 'fs';
import sanity from './sanity';
import { DiscordRole } from './discordRole';

interface Config {
    reactions: boolean;
    voice: boolean;
    verifyMembers: boolean;
    messages?: {
        id: string;
        key: string;
        parentId: string;
    }[];
    filter: {
        enabled: boolean;
        channels: string[];
        whitelist: string[];
    };
}

class Guild {
    public id: string;
    public name: string;
    public guild: GuildClass;
    public config: Config = {
        voice: false,
        reactions: false,
        messages: [],
        verifyMembers: false,
        filter: {
            enabled: false,
            channels: [],
            whitelist: [],
        }
    };
    public channels: {
        [k in "admin" | "information"]: TextChannel;
    } = {
        admin: {} as TextChannel,
        information: {} as TextChannel,
    };
    public roles: DiscordRole[] = [];
    public churches: Church[];
    failed = 0;

    constructor(guild: GuildClass) {
        this.id = guild.id;
        this.guild = guild;
        this.name = guild.name;
        if (existsSync(`./data/guilds/${this.id}.json`)) {
            const result = JSON.parse(readFileSync(`./data/guilds/${this.id}`, { encoding: 'UTF8'})) as Config;
            if (result) {
                this.config = result;
                this.config.filter = result.filter || {
                    enabled: false,
                    channels: [],
                    whitelist: [],
                };
                if (this.config.messages) this.fetchMessages();
            }
        }
    }

    async initialize(): Promise<void> {
        const config = await sanity.fetch(`*[_type == 'discordServer' && guildId == '${this.id}'][0]{..., 'organizationRoles': *[_type == 'organization' && defined(discordRoleId)].discordRoleId}`) as SanityGuild;

        if (config?._id) {
            config.gameRoles?.forEach(role => {
                this.roles.push(new DiscordRole("game", this.guild.roles.cache.get(role.roleId), role.emojiName));
            });

            config.nationRoles?.forEach(role => {
                this.roles.push(new DiscordRole("nation", this.guild.roles.cache.get(role.roleId)));
            });

            config.organizationRoles.forEach(role => {
                this.roles.push(new DiscordRole("organization", this.guild.roles.cache.get(role)));
            });

            config.communityRoles.forEach(role => {
                this.roles.push(new DiscordRole("community", this.guild.roles.cache.get(role.roleId), role.emojiName));
            })

            // this.roles = {
            //     games: config?.gameRoles,
            //     nations: config?.nationRoles,
            //     churches: config?.churches,
            //     organizations: config?.organizationRoles,
            // };
            
            this.churches = config.churches;

            config.channels.forEach(channel => {
                this.channels[channel.name] = this.guild?.channels?.cache.get(channel.id);
            });
        } else {
            console.log(`NO CONFIG FOUND FOR ${this.name} | ${this.id}`)
        }
    }

    refreshConfig(): Promise<void> {
        this.roles = [];
        return this.initialize();
    }

    toggleReactions(): boolean {
        this.config.reactions = !this.config.reactions;
        this.save();
        return this.config.reactions;
    }

    toggleVerification(): boolean {
        this.config.verifyMembers = !this.config.verifyMembers;
        this.save();
        return this.config.verifyMembers;
    }

    toggleVoice(): boolean {
        this.config.voice = !this.config.voice;
        this.save();
        return this.config.voice;
    }

    toggleFilter(): boolean {
        this.config.filter.enabled = !this.config.filter.enabled;
        this.save();
        return this.config.filter.enabled;
    }

    filterWhitelistAdd(domain: string): boolean {
        // if (!domain.includes("https://") && !domain.includes("http://")) return false;
        this.config.filter.whitelist.push(domain);
        this.save();
        return true;
    }

    filterWhitelistRemove(domain: string): boolean {
        // if (!domain.includes("https://") && !domain.includes("http://")) return false;
        this.config.filter.whitelist = this.config.filter.whitelist.filter(
            (wl) => wl !== domain
        );
        this.save();
        return true;
    }

    filterChannelAdd(channelId: string): boolean {
        this.config.filter.channels.push(channelId);
        this.save();
        return true;
    }

    filterClearChannels(): boolean {
        this.config.filter.channels = [];
        this.save();
        return true;
    }

    filterGet(): MessageEmbed {
        return new MessageEmbed()
            .setTitle('Text filter/whitelist')
            .setDescription(
                `**Channels filtered**\n<#${this.config.filter.channels.join(
                    '>\n<#'
                )}>\n\n**All whitelisted domains**\n${this.config.filter.whitelist.join(
                    '\n'
                )}`
            );
    }

    filterCheck(message: Message): boolean {
        if (message.member.roles.cache.some((r) =>
            ['Administrator', 'Moderator', 'Tournament Admin', 'Chat Moderator'].includes(
                r.name
            )
        )) {
            return false;
        }
        if (this.config.filter.channels.includes(message.channel.id)) {
            const content = message.content.split(" ").filter(arg => arg.search(/[\d\D]\.[\d\D]/) >= 0);
            for (const arg of content) {
                if (!this.config.filter.whitelist.includes(arg)) {
                    return true;
                }
            }
        }
        return false;
    }

    setMessages(config: string): boolean {
        this.config.messages = JSON.parse(config) || [];
        this.save();
        return true;
    }

    getConfig(): MessageEmbed {
        return new MessageEmbed()
            .setTitle('Server Configuration')
            .addField('ID', `${this.id}`)
            .addField('Name', `${this.name}`)
            .addField(
                'Voice',
                `${this.config.voice ? 'Enabled' : 'Disabled'}`,
                true
            )
            .addField(
                'Verification',
                `${this.config.verifyMembers ? 'Enabled' : 'Disabled'}`,
                true
            )
            .addField(
                'Reactions',
                `${this.config.reactions ? 'Enabled' : 'Disabled'}`,
                true
            )
            .addField(
                'Filter',
                `${this.config.filter.enabled ? 'Enabled' : 'Disabled'}`
            )
            .addField('Messages', `${this.config.messages.length}`, true);
    }

    fetchMessages(): void {
        this.config.messages.forEach(async (message) => {
            const channel = client.channels.cache.get(
                message.parentId
            ) as TextChannel;
            await channel?.messages.fetch(message.id);
            console.log(channel?.name);
        });
    }

    save(): void {
        writeFileSync(`./data/guilds/${this.id}.json`, JSON.stringify(this.config));
    }

    delete(): void {
        unlinkSync(`./data/guilds/${this.id}.json`);
        delete guilds[this.id];
    }
}

export default Guild;
