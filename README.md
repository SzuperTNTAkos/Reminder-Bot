# About the bot:
This bot reminds the server about upcoming exams at a specified time, a certain number of days before the exam.

# Commands:
- **/help**: Displays a helpful message.
- **/config**: Has to be run before the bot can be used. Specifies when the bot should send it's reminders. The bot will send it's reminders in the same channel, that /config was last ran.
- **/getconfig**: Displays all config data. If the channel in which the bot was configured is deleted, the config settings go with it.
- **/exam**: Adds a new exam to the list of exams. Specifying a date that is already over will be assumed to be next year.
- **/list**: Lists all upcoming exams along whith their ids.
- **/edit**: Edits the exam with the specified id
- **/remove**: Removes the exam with the specified id.
- **/removeall**: Removes all exams.
- **/reset**: Removes and deletes the configs.
- **/manageroles:** Allows you to manage what roles can use what commands.
- **/listroles:** Lists what roles can use what commands.
