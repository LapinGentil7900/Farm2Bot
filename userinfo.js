const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  ChannelType,
  AttachmentBuilder,
} = require('discord.js');
const { generateTranscript, formatMessage } = require('./helpers');

/**
 * Crée un nouveau ticket
 */
async function createTicket(interaction, reason = 'support') {
  const config = interaction.client.config.tickets;
  const guild = interaction.guild;
  const member = interaction.member;

  // Vérifier ticket existant
  const existing = guild.channels.cache.find(
    c => c.name.startsWith('ticket-') && c.topic === `ticket:${member.id}`
  );
  if (existing) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor('#ED4245').setDescription(`❌ Tu as déjà un ticket ouvert : ${existing}`)],
      ephemeral: true,
    });
  }

  // Catégorie "En attente"
  const category = guild.channels.cache.get(config.categoryWaiting);

  const channel = await guild.channels.create({
    name: `ticket-${member.user.username}`,
    type: ChannelType.GuildText,
    parent: category?.id,
    topic: `ticket:${member.id}`,
    permissionOverwrites: [
      { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
      { id: member.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory] },
      { id: config.staffRoleId, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.ManageChannels] },
    ],
  });

  // Message d'ouverture
  const openMsg = formatMessage(config.ticketOpenMessage, {
    user: `<@${member.id}>`,
    username: member.user.username,
    reason,
  });

  const embed = new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('🎫 Ticket ouvert')
    .setDescription(openMsg)
    .addFields({ name: 'Raison', value: reason, inline: true })
    .setTimestamp();

  const row = buildTicketButtons('open');

  const staffPing = config.pingStaffOnOpen ? `<@&${config.staffRoleId}>` : '';
  await channel.send({ content: staffPing || undefined, embeds: [embed], components: [row] });

  await interaction.reply({
    embeds: [new EmbedBuilder().setColor('#57F287').setDescription(`✅ Ton ticket a été créé : ${channel}`)],
    ephemeral: true,
  });

  await logTicketAction(interaction.client, 'open', member, channel, reason);
}

/**
 * Ferme un ticket (le déplace en "Fermé" et retire les permissions du créateur)
 */
async function closeTicket(interaction) {
  const config = interaction.client.config.tickets;
  const channel = interaction.channel;
  const guild = interaction.guild;
  const memberId = channel.topic?.replace('ticket:', '');
  if (!memberId) return;

  const category = guild.channels.cache.get(config.categoryClosed);

  await channel.permissionOverwrites.edit(memberId, {
    ViewChannel: false,
    SendMessages: false,
  });

  if (category) await channel.setParent(category.id, { lockPermissions: false });
  await channel.setName(`fermé-${channel.name.replace('ticket-', '')}`);

  const embed = new EmbedBuilder()
    .setColor('#ED4245')
    .setTitle('🔒 Ticket fermé')
    .setDescription(`Ticket fermé par <@${interaction.user.id}>.\nUtilise **Rouvrir** pour le réouvrir ou **Supprimer** pour le supprimer.`)
    .setTimestamp();

  const row = buildTicketButtons('closed');

  await interaction.reply({ embeds: [embed], components: [row] });
  await logTicketAction(interaction.client, 'close', interaction.member, channel);
}

/**
 * Rouvre un ticket fermé
 */
async function reopenTicket(interaction) {
  const config = interaction.client.config.tickets;
  const channel = interaction.channel;
  const guild = interaction.guild;
  const memberId = channel.topic?.replace('ticket:', '');
  if (!memberId) return;

  const category = guild.channels.cache.get(config.categoryOpen);

  await channel.permissionOverwrites.edit(memberId, {
    ViewChannel: true,
    SendMessages: true,
  });

  if (category) await channel.setParent(category.id, { lockPermissions: false });
  await channel.setName(channel.name.replace('fermé-', 'ticket-'));

  const embed = new EmbedBuilder()
    .setColor('#57F287')
    .setTitle('🔓 Ticket réouvert')
    .setDescription(`Ticket réouvert par <@${interaction.user.id}>.`)
    .setTimestamp();

  const row = buildTicketButtons('open');

  await interaction.reply({ embeds: [embed], components: [row] });
  await logTicketAction(interaction.client, 'reopen', interaction.member, channel);
}

/**
 * Supprime un ticket avec transcript optionnel
 */
async function deleteTicket(interaction) {
  const config = interaction.client.config.tickets;
  const channel = interaction.channel;

  const embed = new EmbedBuilder()
    .setColor('#FEE75C')
    .setDescription(`🗑️ Ce ticket sera supprimé dans **${config.deleteDelay} secondes**...`);

  await interaction.reply({ embeds: [embed] });

  // Transcript
  if (config.transcriptEnabled) {
    const transcript = await generateTranscript(channel);
    const buffer = Buffer.from(transcript, 'utf-8');
    const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.txt` });

    const logChannel = interaction.guild.channels.cache.get(config.logChannelId);
    if (logChannel) {
      await logChannel.send({
        embeds: [
          new EmbedBuilder()
            .setColor('#FEE75C')
            .setTitle('📄 Transcript de ticket')
            .setDescription(`Ticket \`${channel.name}\` supprimé par <@${interaction.user.id}>`)
            .setTimestamp(),
        ],
        files: [attachment],
      });
    }
  }

  setTimeout(() => channel.delete().catch(() => {}), config.deleteDelay * 1000);
}

/**
 * Construit les boutons selon l'état du ticket
 */
function buildTicketButtons(state = 'open') {
  const row = new ActionRowBuilder();

  if (state === 'open') {
    row.addComponents(
      new ButtonBuilder().setCustomId('ticket_close').setLabel('Fermer').setEmoji('🔒').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('ticket_delete').setLabel('Supprimer').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    );
  } else if (state === 'closed') {
    row.addComponents(
      new ButtonBuilder().setCustomId('ticket_reopen').setLabel('Rouvrir').setEmoji('🔓').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('ticket_delete').setLabel('Supprimer').setEmoji('🗑️').setStyle(ButtonStyle.Secondary),
    );
  }

  return row;
}

/**
 * Log une action ticket dans le salon de logs
 */
async function logTicketAction(client, action, member, channel, reason = null) {
  const config = client.config.tickets;
  const logChannel = client.guilds.cache
    .first()
    ?.channels.cache.get(config.logChannelId);
  if (!logChannel) return;

  const labels = {
    open: { label: 'Ouverture', color: '#57F287', emoji: '🎫' },
    close: { label: 'Fermeture', color: '#ED4245', emoji: '🔒' },
    reopen: { label: 'Réouverture', color: '#5865F2', emoji: '🔓' },
    delete: { label: 'Suppression', color: '#FEE75C', emoji: '🗑️' },
  };

  const { label, color, emoji } = labels[action] || labels.open;

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${emoji} Ticket — ${label}`)
    .addFields(
      { name: 'Utilisateur', value: `<@${member.id}> (${member.user.tag})`, inline: true },
      { name: 'Salon', value: `${channel}`, inline: true },
    )
    .setTimestamp();

  if (reason) embed.addFields({ name: 'Raison', value: reason, inline: true });

  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = { createTicket, closeTicket, reopenTicket, deleteTicket, buildTicketButtons };
