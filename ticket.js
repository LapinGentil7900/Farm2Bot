const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Gestion des tickets')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageGuild)
    .addSubcommand(sub =>
      sub.setName('panel').setDescription('Envoie le panel de création de ticket dans ce salon')
    )
    .addSubcommand(sub =>
      sub.setName('add').setDescription('Ajoute un utilisateur au ticket')
      .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur à ajouter').setRequired(true))
    )
    .addSubcommand(sub =>
      sub.setName('remove').setDescription('Retire un utilisateur du ticket')
      .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur à retirer').setRequired(true))
    ),

  async execute(interaction, client) {
    const cfg = client.config.tickets;
    const sub = interaction.options.getSubcommand();

    if (sub === 'panel') {
      const embed = new EmbedBuilder()
        .setColor(cfg.embedColor)
        .setTitle(cfg.panelTitle)
        .setDescription(cfg.panelDescription)
        .setFooter({ text: 'Sélectionne la raison de ta demande.' })
        .setTimestamp();

      const select = new StringSelectMenuBuilder()
        .setCustomId('ticket_reason')
        .setPlaceholder('📋 Sélectionne une raison...')
        .addOptions(
          cfg.reasons.map(r => ({
            label: r.label,
            value: r.value,
            emoji: r.emoji,
          }))
        );

      const row = new ActionRowBuilder().addComponents(select);

      await interaction.channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: '✅ Panel envoyé !', ephemeral: true });
    }

    else if (sub === 'add') {
      const isTicket = interaction.channel?.topic?.startsWith('ticket:');
      if (!isTicket) return interaction.reply({ content: '❌ Utilise cette commande dans un ticket.', ephemeral: true });

      const user = interaction.options.getUser('utilisateur');
      await interaction.channel.permissionOverwrites.edit(user.id, {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#57F287').setDescription(`✅ <@${user.id}> a été ajouté au ticket.`)],
      });
    }

    else if (sub === 'remove') {
      const isTicket = interaction.channel?.topic?.startsWith('ticket:');
      if (!isTicket) return interaction.reply({ content: '❌ Utilise cette commande dans un ticket.', ephemeral: true });

      const user = interaction.options.getUser('utilisateur');
      await interaction.channel.permissionOverwrites.delete(user.id);

      await interaction.reply({
        embeds: [new EmbedBuilder().setColor('#ED4245').setDescription(`✅ <@${user.id}> a été retiré du ticket.`)],
      });
    }
  },
};
