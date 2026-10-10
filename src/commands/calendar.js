const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js")

const Database = require("better-sqlite3")
const db = new Database("database.db")

function extractEmojiFromRoleName(name) {
  const match = name.match(/\p{Extended_Pictographic}/u)
  return match ? match[0] : null
}

function buildCalendar(year, month, exams, guild) {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const map = {}

  for (const e of exams) {
    let emoji = "🗓️"

    if (e.pings) {
      const ids = e.pings.split(",").map(x => x.trim())
      for (const id of ids) {
        const role = guild.roles.cache.get(id)
        if (role) {
          const em = extractEmojiFromRoleName(role.name)
          if (em) {
            emoji = em
            break
          }
        }
      }
    }

    map[e.day] = emoji
  }

  let out = ""
  let col = 0

  for (let d = 1; d <= daysInMonth; d++) {
    out += (map[d] || d.toString().padStart(2," ")) + " "
    col++
    if (col === 7) {
      out += "\n"
      col = 0
    }
  }

  return out.trim()
}

async function showCalendar(interaction, year, month) {
  // If not provided, use current month
  if (year === undefined || month === undefined) {
    const now = new Date()
    year = now.getFullYear()
    month = now.getMonth()
  }

  const exams = db.prepare(`
    SELECT day, pings FROM exams
    WHERE guildid = ? AND year = ? AND month = ?
  `).all(interaction.guildId, year, month)

  const calendar = buildCalendar(year, month, exams, interaction.guild)

  const date = new Date(year, month, 1)
  const monthName = date.toLocaleString("en-US", { month: "long" })

  const embed = new EmbedBuilder()
    .setTitle(`📅 ${monthName} ${year}`)
    .setDescription("```" + calendar + "```")

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`cal_prev_${year}_${month}`)
      .setLabel("⬅️")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`cal_next_${year}_${month}`)
      .setLabel("➡️")
      .setStyle(ButtonStyle.Secondary)
  )

  if (interaction.replied || interaction.deferred)
    return interaction.editReply({ embeds:[embed], components:[row] })

  await interaction.reply({ embeds:[embed], components:[row] })
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("calendar")
    .setDescription("Show exam calendar for current month"),

  async execute(interaction) {
    await showCalendar(interaction)
  },

  showCalendar
}
