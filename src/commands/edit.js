const { EmbedBuilder } = require('@discordjs/builders')
const Database = require('better-sqlite3')
const { listPings, toDate, toCsv, isValidPing } = require('../misc')
const db = new Database('database.db', {fileMustExist: true})

async function edit(interaction, client){
    const examcnt = db
    .prepare('SELECT COUNT(*) AS cnt FROM exams WHERE guildid = ?')
    .get(interaction.guildId).cnt
    let errors = ''
    if(examcnt === 0){
        errors += '- There are no upcoming exams\n'
    }
    else if(examcnt < interaction.options.get('id').value){
        if(examcnt === 1){
            errors += '- There is only **1** exam\n'
        }
        else{
            errors += `- There are only **${examcnt}** exams`
        }
    }
    else if(interaction.options.get('id').value <= 0){
        errors += '- Id mustn\'t be **0** or **negative**\n'
    }
    const subjectlen = 30
    const typelen = 30
    const topiclen = 256
    const maxpings = 10
    const date = toDate(interaction.options.get('date')?.value)

    const isvaliddate = date !== null
    const isnottoolongsubjectlen = interaction.options.get('subject')?.value.length <= subjectlen
    const isnottoolongtypelen = interaction.options.get('type')?.value.length <= typelen
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
    if(interaction.options.data.map(e => e.name === 'id' ? null : e.value).filter(e => e !== null) == false){
        errors += '- Nothing was provided to change\n'
    }
    else{
        if (!isvaliddate && interaction.options.get('date') !== null){
            errors += `- **${interaction.options.get('date').value}** is not a valid **date** in the MM.DD. format!\n`
        }
        if (!isnottoolongsubjectlen && interaction.options.get('subject') !== null){
            errors += `- **Subject name** longer than **${subjectlen}** characters!\n`
        }
        if (!isnottoolongtypelen && interaction.options.get('type') !== null){
            errors += `- **Exam type** longer than **${typelen}** characters!\n`
        }
        if (!isnottoolongtopiclen && interaction.options.get('topic') !== null){
            errors += `- **Topic** longer than **${topiclen}** characters!\n`
        }
        if (!isvalidpings && interaction.options.get('special_pings') !== null){
            errors += '- **List of pings** did not match the specification\n'
        }
        else if (!isnottoomanypings && interaction.options.get('special_pings') !== null){
            errors += `- A maximum of **${maxpings} special pings** can be specified\n`
        }
    }
    if (errors.length > 0){
        const embed = new EmbedBuilder()
        .setTitle('Error')
        .setColor(0xD80000)
        .setDescription(errors)
        interaction.reply({embeds: [embed]})
    }
    else{
        let toChange = []
        let newData = {}
        let changes = ''
        const databaseId = db
        .prepare(`SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY year, month, day) AS rownum FROM exams WHERE guildid = '${interaction.guildId}') WHERE rownum = ${interaction.options.get('id').value}`)
        .get().id
        const oldData = db
        .prepare(`SELECT * FROM exams WHERE id = '${databaseId}'`)
        .get()
        if (interaction.options.get('date') !== null){
            toChange.push(' year = @year, month = @month, day = @day')
            newData = {
                year: date.getFullYear(),
                month: date.getMonth(),
                day: date.getDate(),
            }
            const now = new Date()
            changes += `- ${oldData.year > now.getFullYear() ? `${oldData.year}.` : ''}${`${oldData.month + 1}`.padStart(2, '0')}.${`${oldData.day}`.padStart(2, '0')}. -> ${date.getFullYear() > now.getFullYear() ? `${date.getFullYear()}.` : ''}${`${date.getMonth() + 1}`.padStart(2, '0')}.${`${date.getDate()}`.padStart(2, '0')}.\n`
        }
        if (interaction.options.get('subject') !== null){
            toChange.push(' subject = @subject')
            newData.subject = interaction.options.get('subject').value
            changes += `- ${oldData.subject} -> ${interaction.options.get('subject').value}\n`
        }
        if (interaction.options.get('type') !== null){
            toChange.push(' type = @type')
            newData.type = interaction.options.get('type').value
            changes += `- ${oldData.type} -> ${interaction.options.get('type').value}\n`
        }
        if (interaction.options.get('topic') !== null){
            toChange.push(' topic = @topic')
            newData.topic = interaction.options.get('topic').value
            changes += `- ${oldData.topic} -> ${interaction.options.get('topic').value}\n`
        }
        if (interaction.options.get('special_pings') !== null){
            toChange.push(' pings = @pings')
            newData.pings = toCsv(interaction.options.get('special_pings').value)
            changes += `- ${await listPings({ping: false, pings: oldData.pings, guild: interaction.guild, client: client})} -> ${await listPings({ping: false, pings: interaction.options.get('special_pings').value.split(' ').map(e => e.slice(2, e.length - 1)), guild: interaction.guild, client: client})}`
        }
        console.log(newData)
        db
        .prepare(`UPDATE exams SET${toChange} WHERE id = ${databaseId}`)
        .run(newData)
        const embed = new EmbedBuilder()
        .setTitle('Success')
        .setColor(0x00C000)
        .addFields({
            name: 'Changes:',
            value: changes
        })
        interaction.reply({embeds: [embed]})
    }
}

module.exports = {edit}