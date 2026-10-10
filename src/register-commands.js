require('dotenv').config();

const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'exam',
        description: 'Reminds you of the exam the specified date and time.',
        options: [
            {
                name: 'date',
                description: '(MM.DD.)',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'subject',
                description: 'The subject of the class.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'type',
                description: 'The type of exam.',
                type: ApplicationCommandOptionType.String,
                required: true
            },
            {
                name: 'topic',
                description: 'The topic of the exam.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'special_pings',
                description: 'Multiple pings can be specified by writing them one after the other.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'config',
        description: 'Sets when to send reminders.',
        options: [
            {
                name: 'time',
                description: 'At what time should the reminders be sent (HH:MM)?',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'days_in_advance',
                description: 'How many days in advance should the reminder be sent?',
                type: ApplicationCommandOptionType.Integer,
                required: false
            },
            {
                name: 'embedcolor',
                description: 'Sets the color of the embeds in the reminders and the list produced by /list.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'list',
        description: 'Lists all exams.',
        options: [
            {
                name: 'user',
                description: 'Only shows exams relevant to this user. \"me\" is an alias for yourself.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'remove',
        description: 'Removes an exam at the specified id.',
        options: [
            {
                name: 'id',
                description: 'The id of the exam to remove.',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    },
    {
        name: 'help',
        description: 'Provides information on how to use the bot.'
    },
    {
        name: 'getconfig',
        description: 'Displays all info in the config.'
    },
    {
        name: 'removeall',
        description: 'Removes all exams.'
    },
    {
        name: 'reset',
        description: 'Resets and deletes the configs.'
    },
    {
        name: 'calendar',
        description: 'A cleaner way to see your duties.'
    }
        name: 'manageroles',
        description: 'Lets the admins set which commands can be run by what roles (including @everyone or admin).',
        options: [
            {
                name: 'config',
                description: 'Who can use /config.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'exam',
                description: 'Who can use /exam.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'getconfig',
                description: 'Who can use /getconfig.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'help',
                description: 'Who can use /help.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'list',
                description: 'Who can use /list.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'listroles',
                description: 'Who can use /listroles.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'manageroles',
                description: 'Who can use /manageroles.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'remove',
                description: 'Who can use /remove.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'removeall',
                description: 'Who can use /removeall.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'reset',
                description: 'Who can use /reset.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'edit',
                description: 'Who can use /edit.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
    {
        name: 'listroles',
        description: 'Lists all commands and what roles can use them.'
    },
    {
        name: 'edit',
        description: 'Reminds you of the exam the specified date and time.',
        options: [
            {
                name: 'id',
                description: 'The id of the exam to edit.',
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: 'date',
                description: '(MM.DD.)',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'subject',
                description: 'The subject of the class.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'type',
                description: 'The type of exam.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'topic',
                description: 'The topic of the exam.',
                type: ApplicationCommandOptionType.String,
                required: false
            },
            {
                name: 'special_pings',
                description: 'Multiple pings can be specified by writing them one after the other.',
                type: ApplicationCommandOptionType.String,
                required: false
            }
        ]
    },
]

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID,
            ),
            { body: commands }
        )
        console.log('Registering slash commands done successfuly!')
    } catch (error) {
        console.log(`Error: ${error}`);
    }
})();