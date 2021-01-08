import { Message, MessageEmbed } from 'discord.js';
import config from '../config';

// export interface Event {
//     title: string;
//     description: string;
//     date: Date;
//     type: 'tournament' | 'event';
//     rules?: string;
//     schedule: string;
//     prize?: string;
//     signup_link?: string;
//     host: {
//         displayName: string;
//         id: string;
//     };
// }

const help = `**BUK GAMING**
The bot is under constant development so this message might not currently be accurate.

**VOICE CHANNELS**
To create a voice channel, join the "🎮 Create Channel 🎮" channel. As the channel creator you can:
\`\`\`css
- change channel name
- move members
- set user limit
- set channel bitrate
\`\`\`
If a voice channel is set to Private, you can add players with \`!add @player\`

**ORGANIZATIONS**
Get roles for organizations with more than 20 members by reacting to the emoji: 🌐 attached to the message in <#${config.discord.messages?.find((m) => m.key == 'information')?.parentId}>

When you have an Organization role, you can use the 🌐 emoji in <#${config.discord.messages?.find(m => m.key == 'voice')?.parentId}> to only allow members of those organizations to join your channel.

**ROLES**
You can get roles by reacting to the messages in <#${config.discord.messages?.find((m) => m.key == 'information')?.parentId}>.

**SUGGESTIONS**
Can be sent directly to this bot.
`;

const notRegistered = `**NOT FOUND**
You're not registered on the BUK Gaming Website (https://buk.gg).
Link your Discord to your profile and type "__!join__" in any chat when it's linked.

**Troubleshooting**
If you've already linked your Discord to your BUK Gaming account, try matching your tag on the website to your client tag. You might be logged into a different account in your browser which will result in the wrong account getting linked.

If you still have problems, contact an Administrator (Through#0001)

**Other Problems**
If you can't see any channels (not even #welcome), leave the discord and rejoin after you properly connect your Discord account.`;

const admin = `**For Administrators**
\`\`\`css
!teams create [@captain] [game] [team name-]
- creates a team and a text-channel related to the team. check !role for valid games

!teams mention [game]
- mention all teams registered in the desired game.

!teams delete [team]
- deletes the team role and from the database, but the text-channel must be deleted manually (can only be accessed by an Administrator)

!player [add|remove] [@player]
- only available to the captain of a team, adds or removes a player from a team\`\`\``;

const voice = `**Usage command: !voice**
\`\`\`css
!voice lock | denies access to voice channel for anyone not explicitly added to the channel (or moved over from Lobby)
!voice close | allows players who are already in the channel to rejoin after leaving
!voice hide | hides the channel from anyone not given access
!add [@player] | same as above\`\`\`

**Channel settings**
Right click on Channel, click "Manage Channel", and set channel name, bitrate and userlimit.`;

export const embeds = {
    info(): MessageEmbed {
        const information = new MessageEmbed()
            .setTitle('BUK Gaming Discord')
            .setDescription(
                `Welcome to the Official BUK Gaming Discord Server! This server is synced with the BUK Gaming Website, located at https://buk.gg.\n\nInformation and activities related to the BUK Camps will be posted and hosted here through this discord.`
            )
            .setURL('https://buk.gg')
            .setFooter(
                'Brunstad Ungdomsklubb Gaming',
                'https://www.brunstadungdomsklubb.org/wp-content/uploads/2019/10/cropped-BUK-colours-1-270x270.png'
            )
            .addField(
                'PURPOSE',
                `The purpose of this Discord is to replace all local communication platforms to gather all online and social church-activities into one place.`
            )
            .addField(
                'TEMPORARY CHANNELS',
                `Join \`Create Channel\` and set name, userlimit, bitrate and privacy! check out \`#commands\` for more info`,
                true
            )
            .addField(
                'GAMES',
                `React below to get a game-role and gain access to the game-exclusive chats.`,
                true
            )
            .addField('\u200b', '\u200b', true)
            .addField(
                'ORGANIZATIONS',
                `\nWe have dedicated text-chats and features specific for Organizations. Register your Organization on buk.gg and get your role by reacting with 🌐`,
                true
            )
            .addField('\u200b', '\u200b', true)
            // .addField("-------------------", `**PICKUP GAMES**\nFor a handful of games, we support automatic organization of PUGs! PUGs are practice games where players sign up to join and play with friends outside of matchmaking in a private match.\n\nGet the gameroles and type \`-join\` in the chat to join.`)
            .addField(
                'CALENDAR',
                `We have a calendar we will fill up with events in the near future. If you're interested in helping out, contact <@101330901526392832>`
            )
            .addField(
                'HELP',
                'React with ❓ below to receive a help message.',
                true
            )
            .addField(
                'SUGGESTIONS',
                `Any and all suggestions can be sent to me (<@551349691959345177>)`,
                true
            )
            .addField('\u200b', '\u200b', true)
            .setThumbnail(
                'https://www.brunstadungdomsklubb.org/wp-content/uploads/2019/10/cropped-BUK-colours-1-270x270.png'
            );
        return information;
    },
    dm(message: Message): MessageEmbed {
        const embed = new MessageEmbed()
            .setColor(3066993)
            .setFooter(`Direct Message | ${message.author.id}`)
            .setDescription(message.content + `\n\n <@${message.author.id}>`)
            .setAuthor(`${message.author.tag}`);
        return embed;
    },
    // eventEmbed(event: Event) {
    //     const embed = new MessageEmbed()
    //         .setTitle(event.title)
    //         .setDescription(event.description);
    //     if (event.type === 'tournament') {
    //         const color = 2123412;
    //         embed
    //             .setColor(color)
    //             .addField(
    //                 '--------------',
    //                 `📆 **SCHEDULE**\n\`\`\`cs\n# ${event.schedule.replace(
    //                     /\n/g,
    //                     '\n# '
    //                 )}\`\`\``,
    //                 true
    //             )
    //             .addField(
    //                 '--------------',
    //                 `🎮 **RULES**\n\`\`\`cs\n# ${event.rules.replace(
    //                     /\n/g,
    //                     '\n# '
    //                 )}\`\`\``,
    //                 true
    //             )
    //             .addField('\u200b', '\u200b', true)
    //             .addField(
    //                 '--------------',
    //                 `🏆 **PRIZE**\`\`\`cs\n# ${event.prize.replace(
    //                     /\n/g,
    //                     '\n# '
    //                 )}\`\`\``,
    //                 true
    //             )
    //             .addField(
    //                 '--------------',
    //                 `🎗️ **GENERAL**\`\`\`cs\n# Show up for your matches\n# No inappropriate behaviour\`\`\``
    //             )
    //             .setFooter(`Tournament Admin: ${event.host.displayName}`);
    //         if (event.signup_link) {
    //             embed.addField(
    //                 '---------------',
    //                 `✅ [**SIGN UP**](${event.signup_link})`
    //             );
    //         }
    //     } else {
    //         const color = 3066993;
    //         embed
    //             .setColor(color)
    //             .addField('Date & Time', event.schedule, true)
    //             .setFooter(`Host: ${event.host.displayName}`);
    //     }
    //     return embed;
    setRules(): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle('**RULES**')
            .setDescription('All rules related to this Discord')
            .addFields(
                {
                    name: 'No spamming',
                    value: `Do not spam any text or voice chats.`,
                },
                {
                    name: 'No harassing',
                    value: `Harassment of fellow members is not tolerated`,
                },
                {
                    name: 'Language',
                    value:
                        'Primary languages of this server is Norwegian and English. \nOther languages should be kept in smaller text channels.',
                }
            );
        return embed;
    },
    organizations(): MessageEmbed {
        const embed = new MessageEmbed()
            .setTitle('**ORGANIZATIONS**')
            .setDescription('Feature description of Organizations on buk.gg.')
            .addFields(
                {
                    name: 'FEATURES',
                    value: `\`\`\`cs\n# Administrative tools\n# Teams\n# Easy tournament signup\n# Private chat\n\`\`\``,
                },
                {
                    name: 'TEAMS',
                    value: `A team is a collection of members connected to a specific game. Teams can participate in official BUK Tournaments`,
                    inline: true,
                },
                {
                    name: 'CAPTAINS',
                    value: `Captains can edit their team name and sign their team up for tournaments and events.`,
                    inline: true,
                }
            )
            .setFooter('WEBSITE FEATURE')
            .setAuthor('BUK Gaming')
            .setColor('RED');
        return embed;
    }
};

export const Help = {
    help,
    voice,
    admin,
    notRegistered,
};
