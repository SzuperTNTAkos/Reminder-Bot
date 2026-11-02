const { EmbedBuilder } = require('discord.js');

function help(interaction){
    const embed = new EmbedBuilder()
        .setColor(0xffffff)
        .setTitle('Help & Commands')
        .setDescription('This bot reminds the server about upcoming exams at a specified time, a certain number of days before the exam.')
        .addFields(
            {
                name: 'Setup',
                value: `- **/config:** Has to be run before the bot can be used. Specifies when the bot should send it's reminders. The bot will send it's reminders in the same channel, that /config was last ran.\n` +
                    `- **/getconfig:** Displays all config data. If the channel in which the bot was configured is deleted, the config settings go with it.\n` +
                    `- **/reset:** Removes and deletes the configs.`
            },
            {
                name: 'Exam Management',
                value: `- **/exam:** Adds a new exam to the list of exams. Specifying a date that is already over will be assumed to be next year.\n` +
                    `- **/list:** Lists all upcoming exams along whith their ids.\n` +
                    `- **/edit:** Edits the exam with the specified id\n` +
                    `- **/remove:** Removes the exam with the specified id.\n` +
                    `- **/removeall:** Removes all exams.`
            },
            {
                name: 'Utility',
                value: `- **/manageroles:** Allows you to manage what roles can use what commands.\n` +
                    `- **/listroles:** Lists what roles can use what commands.\n` +
                    `- **/help:** Displays this message.`
            }
        )
        .setTimestamp()
        .setFooter({ text: 'Exam Reminder Bot' })
        interaction.reply({embeds: [embed] })
}

module.exports = {help}