import { Client } from 'discord.js';
import { colors } from 'console-log.js';
import express from 'express';
import clipboardy from 'clipboardy';
const client = new Client({ intents: 32767 });//All Intents
///Imp
const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT;
//Bot Ready
client.once('ready', () => {
    console.log(colors.cyan(`[API] ${client.user.tag} Is Online, Running In ${client.guilds.cache.size}`))
});
///GuildDelete Event
client.on('guildDelete', (guild) => {
    console.log(`I Left ${guild.name} `);
});
//App 
const app = express();
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    const servers = client.guilds.cache.map((guild) => {
        const textChannel = guild.channels.cache.find((ch) => ch.type === 'GUILD_TEXT');
        const inviteURL = textChannel ? generateInviteURL(textChannel) : null;
        return {
            id: guild.id,
            name: guild.name,
            iconURL: guild.iconURL({ format: 'png', dynamic: true, size: 2048 }),
            ownerID: guild.ownerId,
            memberCount: guild.memberCount,
            inviteURL,
        };
    });
    res.render('index', { servers });
});
app.get('/leave/:serverId', (req, res) => {
    const serverId = req.params.serverId;
    const guild = client.guilds.cache.get(serverId);
    if (guild) {
        guild.leave()
            .then(() => {
                console.log(`Bot left the server with ID: ${serverId}`);
                res.sendStatus(200);
            })
            .catch((error) => {
                console.error(`Error leaving the server with ID ${serverId}:`, error);
                res.sendStatus(500);
            });
    } else {
        res.sendStatus(404);
    }
});
app.get('/invite/:serverId', async (req, res) => {
    const serverId = req.params.serverId;
    const guild = client.guilds.cache.get(serverId);
    const textChannel = guild ? guild.channels.cache.find((ch) => ch.type === 'GUILD_TEXT') : null;
    if (textChannel) {
        try {
            const inviteURL = await generateInviteURL(textChannel);
            await clipboardy.write(inviteURL);
            console.log(inviteURL);
            res.send(inviteURL);
        } catch (error) {
            console.error('Error generating or copying invite:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.status(404).send('Channel Not Found');
    }
});
async function generateInviteURL(channel) {
    if (!channel) {
        console.error('Channel is null. Unable to generate invite.');
        return null;
    }
    try {
        const invite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
        return invite.url;
    } catch (error) {
        console.error('Error generating invite:', error);
        return null;
    }
}
///app-listenning
app.listen(PORT, () => {
    console.log(colors.random(`[EXPRESS] Server running on ${PORT}`));
});
//Login
client.login(TOKEN)
    .catch(() => {
        console.warn(colors.brightRed("[API] Token error at main.js"));
    });


//Copyrights vampire_sekkena 2024