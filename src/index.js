require('dotenv').config()
const {Client, EmbedBuilder, IntentsBitField} = require('discord.js')
const { help } = require('./commands/help')
const { config } = require('./commands/config')
const { exam } = require('./commands/exam')
const { list } = require('./commands/list')
const { remove } = require('./commands/remove')
const { getconfig } = require('./commands/getconfig')
const { removeall } = require('./commands/removeall')
const { showCalendar } = require('./commands/calendar')
const { reset } = require('./commands/reset')
const Database = require('better-sqlite3')
const { channelExists, listPings, isPermitted } = require('./misc')
const { manageroles } = require('./commands/manageroles.js')
const { listroles } = require('./commands/listroles.js')
const { edit } = require('./commands/edit.js')
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds
    ]
})
const db = new Database('database.db', {fileMustExist: true})
const timeout = process.env.TIMEOUT

client.on('clientReady', () => {
    reminder()
})

client.on('interactionCreate', (interaction) => {
    if (interaction.isButton()) {
        if (!interaction.customId.startsWith("cal_")) return

        let [, dir, year, month] = interaction.customId.split("_")

        year = Number(year)
        month = Number(month)

        if (dir === "prev") month--
        if (dir === "next") month++

        if (month < 0) { month = 11; year-- }
        if (month > 11) { month = 0; year++ }

        const calendar = require("./commands/calendar")
        calendar.showCalendar(interaction, year, month)
        }
        
client.on('interactionCreate', async (interaction) => {
    if(interaction.isChatInputCommand()){
        const rowexists = db
        .prepare('SELECT COUNT(*) AS value FROM servers WHERE guildid = ?')
        .get(interaction.guildId).value === 1
        const member = await interaction.guild.members.fetch(interaction.user.id)
        if (isPermitted({member: member, db: db, command: interaction.commandName, guildid: interaction.guildId, rowexists: rowexists})){
            if (interaction.commandName === 'help'){
                help(interaction)
            }
            else if (interaction.commandName === 'config'){
                config(interaction, rowexists)
            }
            else if (!rowexists){
                const embed = new EmbedBuilder()
                .setColor(0xD80000)
                .setTitle('The bot isn\'t configured yet')
                .setDescription('Please configure the bot first!')
                interaction.reply({embeds: [embed]})
            }
            else if (interaction.commandName === 'exam'){
                exam(interaction, client)
            }
            else if(interaction.commandName === 'list'){
                list(interaction, client)
            }
            else if(interaction.commandName === 'remove'){
                remove(interaction)
            }
            else if(interaction.commandName === 'getconfig'){
                getconfig(interaction)
            }
            else if(interaction.commandName === 'removeall'){
                removeall(interaction)
            }
            else if(interaction.commandName === 'reset'){
                reset(interaction)
            }
            else if(interaction.commandName === 'calendar'){
                showCalendar(interaction)
            }
            else if(interaction.commandName === 'manageroles'){
                manageroles(interaction)
            }
            else if(interaction.commandName === 'listroles'){
                listroles(interaction)
            }
            else if(interaction.commandName === 'edit'){
                edit(interaction, client)
            }
        }
        else{
            const embed = new EmbedBuilder()
            .setTitle('Permission denied!')
            .setColor(0xD80000)
            .setDescription('Sorry, you don\'t have the nescessary permissions to run this command')
            interaction.reply({embeds: [embed]})
        }
    }
})

function reminder() {
    setTimeout(async () => {
        const confs = db
        .prepare('SELECT * FROM servers')
        .all()
        for (i = 0; i < confs.length; i++) {
            const chexists = await channelExists(client, confs[i].channelid)
            if (!chexists){
                db
                .prepare('DELETE FROM servers WHERE guildid = ?')
                .run(confs[i].guildId)
            }
            else{
                let embed = new EmbedBuilder()
                .setTitle('Upcoming exams')
                .setColor(confs[i].embedcolor)
                const exams = db
                .prepare('SELECT * FROM exams WHERE guildid = ?')
                .all(confs[i].guildid)
                let nm = ''
                let val = ''
                let pingeveryone = false
                let fieldscnt = 0
                let charcnt = 0
                let result = []
                let sendmsg = false
                for (const exam of exams) {
                    const deletetime = new Date(exam.year, exam.month, exam.day + 1, 0, 0, 0)
                    const remindtime = new Date(exam.year, exam.month, exam.day - confs[i].inadvance, confs[i].hour, confs[i].minute, 0)
                    const now = new Date()
                    if (remindtime.getTime() <= now.getTime() && (exam.notifiedabout === 0)) {
                        sendmsg = true
                        nm = `${exam.type} in ${exam.subject} on ${exam.year > new Date().getFullYear() ? `${exam.year}.` : ''}${exam.month < 9 ? '0' : ''}${exam.month + 1}.${exam.day < 10 ? '0' : ''}${exam.day}.`
                        const pingslist = await listPings({pings: exam.pings, ping: true, guild: client.guilds.cache.get(exam.guildid), client: client})
                        val = `${exam.topic || ''}\n${pingslist}`
                        if(pingslist === ''){
                            pingeveryone = true
                        }
                        if(fieldscnt === 25 || charcnt + nm.length + val.length > 6000){
                            result.push(embed)
                            embed = new EmbedBuilder()
                            .setColor(confs[i].embedcolor)
                            .addFields({name: nm, value: val})
                            fieldscnt = 0
                            charcnt = nm.length + val.length
                        }
                        else{
                            embed.addFields({name: nm, value: val})
                            charcnt += nm.length + val.length
                            fieldscnt++
                        }
                        db
                        .prepare('UPDATE exams SET notifiedabout = ? WHERE id = ?')
                        .run(1, exam.id)
                    }
                    if (now.getTime() > deletetime.getTime()){
                        db
                        .prepare('DELETE FROM exams WHERE id = ?')
                        .run(exam.id)
                    }
                }
                if(sendmsg){
                    result.push(embed)
                    client.channels.cache.get(confs[i].channelid).send({content: pingeveryone ? '@everyone' : undefined, embeds: [result[0]]})
                    for (let j = 1; j < result.length; j++) {
                        client.channels.cache.get(confs[i].channelid).send({embeds: [result[j]]})
                    }
                }
            }
        }
        reminder()
    }, timeout)
}


client.login(process.env.TOKEN)