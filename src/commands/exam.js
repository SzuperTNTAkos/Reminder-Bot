const { EmbedBuilder } = require('@discordjs/builders')
const Database = require('better-sqlite3')
const { listPings, toDate, toCsv, isValidPing } = require('../misc')
const db = new Database('database.db', {fileMustExist: true})

async function exam(interaction, client){
    const maxexam = 50
    const subjectlen = 30
    const typelen = 30
    const topiclen = 256
    const maxpings = 10
    const date = toDate(interaction.options.get('date').value)

    const isnottoomanyexams = db.prepare('SELECT COUNT(*) AS value FROM exams WHERE guildid = ?').get(interaction.guildId).value < maxexam
    const isvaliddate = date !== null
    const isnottoolongsubjectlen = interaction.options.get('subject').value.length <= subjectlen
    const isnottoolongtypelen = interaction.options.get('type').value.length <= typelen
    const isnottoolongtopiclen = (interaction.options.get('topic')?.value || '').length <= topiclen
    let isvalidpings = interaction.options.get('special_pings') === null || /^<@&?\d{1,25}>( <@&?\d{1,25}>)*$/.test(interaction.options.get('special_pings').value)
    if(interaction.options.get('special_pings') !== null){
        const pingarr = interaction.options.get('special_pings').value.split(' ').map(e => e.slice(2, interaction.options.get('special_pings').value.length - 1))
        let i = 0
        while(isvalidpings && i < pingarr.length){
            isvalidpings = await isValidPing(pingarr[i], client)
            i++
        } 
    }
    const isnottoomanypings = interaction.options.get('special_pings')?.value?.match(/<@&?\d+>/g)?.length ?? 0 <= maxpings

    let errors = ''

    if (!isnottoomanyexams){
        errors += `- You cannot have more than **${maxexam}** exams at a time!\n`
    }
    if (!isvaliddate){
        errors += `**${interaction.options.get('date').value}** is not a valid **date** in the MM.DD. format!\n`
    }
    if (!isnottoolongsubjectlen){
        errors += `- **Subject name** longer than **${subjectlen}** characters!\n`
    }
    if (!isnottoolongtypelen){
        errors += `- **Exam type** longer than **${typelen}** characters!\n`
    }
    if (!isnottoolongtopiclen){
        errors += `- **Topic** longer than **${topiclen}** characters!\n`
    }
    if (!isvalidpings){
        errors += '- **List of pings** did not match the specification\n'
    }
    else if (!isnottoomanypings){
        errors += `- A maximum of **${maxpings} special pings** can be specified\n`
    }
    let embed = new EmbedBuilder()
    if (errors === ''){
        const now = new Date()
        const time = db
        .prepare('SELECT inadvance, hour, minute FROM servers WHERE guildid = ?')
        .get(interaction.guildId)
        const notifytime = new Date(date.getFullYear(), date.getMonth(), date.getDate() - time.inadvance, time.hour, time.minute, 0)
        const pingscsv = toCsv(interaction.options.get('special_pings')?.value)
        db
        .prepare('INSERT INTO exams (year, month, day, subject, type, topic, notifiedabout, guildid, pings) VALUES (@year, @month, @day, @subject, @type, @topic, @notifiedabout, @guildid, @pings)')
        .run({
            year: date.getFullYear(),
            month: date.getMonth(),
            day: date.getDate(),
            subject: interaction.options.get('subject').value,
            type: interaction.options.get('type').value,
            topic: interaction.options.get('topic')?.value || '',
            notifiedabout: now.getTime() > notifytime.getTime() ? 1 : 0,
            guildid: interaction.guildId,
            pings: pingscsv
        })
        let result = ''
        result += `- **Subject:** ${interaction.options.get('subject').value}\n- **Type:** ${interaction.options.get('type').value}\n`
        if(interaction.options.get('topic') !== null){  
            result += `- **Topic:** ${interaction.options.get('topic').value}\n`
        }
        result += `- **Date:** ${date.getFullYear()}.${date.getMonth() < 9 ? '0' : ''}${date.getMonth() + 1}.${date.getDate() < 10 ? '0' : ''}${date.getDate()}.\n`
        if(interaction.options.get('special_pings') !== null){  
            result += `- **Pings:** ${await listPings({pings: pingscsv, ping: false, guild: interaction.guild, client: client})}`
        }
        embed
        .setColor(0x00C000)
        .setTitle('Successfully added new exam ✅')
        .setDescription(result)
    }
    else{
        embed
        .setColor(0xD80000)
        .setTitle('Error')
        .setDescription(errors)
    }
    interaction.reply({embeds: [embed]})
}
module.exports = {exam}