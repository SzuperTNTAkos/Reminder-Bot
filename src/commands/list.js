const Database = require('better-sqlite3');
const { EmbedBuilder, time } = require('discord.js');
const { listPings, isValidPing } = require('../misc');
const db = new Database('database.db', {fileMustExist: true, readonly: true})

async function list(interaction, client){
    const conf = db
    .prepare('SELECT * FROM servers WHERE guildid = ?')
    .get(interaction.guildId)
    let exams = db
    .prepare('SELECT * FROM exams WHERE guildid = ? ORDER BY year, month, day')
    .all(interaction.guildId)
    
    if (!(interaction.options.get('user') === null || interaction.options.get('user').value === 'me' || (/^<@\d{1,25}>$/.test(interaction.options.get('user')?.value) && await isValidPing(interaction.options.get('user').value.slice(2, interaction.options.get('user').value.length - 1), client)))){
        const embed = new EmbedBuilder()
        .setColor(0xD80000)
        .setTitle('User not found')
        .setDescription('User doesn\'t exist or the wrong format was used')
        interaction.reply({embeds: [embed]})
    }
    else{
        if (interaction.options.get('user') !== null){
            const user = interaction.options.get('user').value === 'me' ? interaction.member : await interaction.guild.members.fetch(interaction.options.get('user').value.slice(2, interaction.options.get('user').value.length - 1))
            exams = exams.filter(exam => concernsUser(user, exam.pings.split(',')))
        }
        if(exams.length === 0){
            const embed = new EmbedBuilder()
            .setColor(conf.embedcolor)
            .setTitle('📋 List of Exam(s)')
            .setDescription('There are no upcoming exams.')
            interaction.reply({embeds: [embed]})
        }
        else{
            const title = '📋 List of Exam(s)'
            let embed = new EmbedBuilder()
            .setTitle(title)
            .setColor(conf.embedcolor)
            let fieldscnt = 0
            let charcnt = title.length
            //let nm = ''
            //let val = ''
            let result = []
            await client.channels.fetch(interaction.channelId)
            
            for (let i = 0; i < exams.length; i++) {
                // Get day of the week (first 3 letters)
                const examDate = new Date(exams[i].year, exams[i].month, exams[i].day);
                const dayOfWeek = examDate.toLocaleDateString('en-US', { weekday: 'short' });
                // Format date string
                const yearStr = exams[i].year > new Date().getFullYear() ? `${exams[i].year}.` : '';
                const monthStr = `${exams[i].month + 1}`.padStart(2, '0');
                const dayStr = `${exams[i].day}`.padStart(2, '0');
                const dateFormatted = `${yearStr}${monthStr}.${dayStr}. (${dayOfWeek})`;
                // Lazy for more comments brr
                const nm = `${i + 1}. ${exams[i].subject} — ${exams[i].type}`;
                const pingsText = await listPings({pings: exams[i].pings, ping: false, guild: interaction.guild, client: client});
                // Create embed value
                const val = `- **Date:** ${dateFormatted}${exams[i].topic ? `\n- **Topic:** ${exams[i].topic}` : ''}${exams[i].pings ? `\n- **Pings:** ${pingsText}` : ''}`

                if(fieldscnt === 25 || charcnt + nm.length + val.length > 6000){
                    result.push(embed)
                    embed = new EmbedBuilder()
                    .setColor(conf.embedcolor)
                    .addFields({name: nm, value: val})
                    fieldscnt = 0
                    charcnt = nm.length + val.length
                }
                else{
                    embed.addFields({name: nm, value: val})
                    charcnt += nm.length + val.length
                    fieldscnt++
                }
            }
            result.push(embed)
            await interaction.reply({embeds: [result[0]]})  // Messages should be in order now
            for (let i = 1; i < result.length; i++) {
                client.channels.cache.get(interaction.channelId).send({embeds: [result[i]]})
            }
        }
    }
}
module.exports = {list}

function concernsUser(user, pinglist){
    if (user === undefined || pinglist[0] === ''){
        return true
    }
    for (const ping of pinglist) {
        if (ping.slice(0, 1) === '&'){
            if (user.roles.cache.has(ping.slice(1, ping.length))){
                return true
            }
        }
        else if (user.id === ping){
            return true
        }
    }
    return false
}