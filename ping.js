const { EmbedBuilder } = require('discord.js');

/**
 * Remplace les variables de placeholder dans un texte
 */
function formatMessage(template, vars = {}) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

/**
 * Crée un embed de succès
 */
function successEmbed(message, color = '#57F287') {
  return new EmbedBuilder()
    .setColor(color)
    .setDescription(`✅ ${message}`);
}

/**
 * Crée un embed d'erreur
 */
function errorEmbed(message) {
  return new EmbedBuilder()
    .setColor('#ED4245')
    .setDescription(`❌ ${message}`);
}

/**
 * Crée un embed d'info
 */
function infoEmbed(title, description, color = '#5865F2') {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description);
}

/**
 * Génère un transcript HTML basique du salon
 */
async function generateTranscript(channel) {
  const messages = await channel.messages.fetch({ limit: 100 });
  const sorted = [...messages.values()].reverse();

  const lines = sorted.map(m => {
    const time = m.createdAt.toLocaleString('fr-FR');
    const author = m.author?.tag || 'Inconnu';
    const content = m.content || (m.embeds.length ? '[embed]' : '[fichier]');
    return `[${time}] ${author}: ${content}`;
  });

  return lines.join('\n');
}

module.exports = { formatMessage, successEmbed, errorEmbed, infoEmbed, generateTranscript };
