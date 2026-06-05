const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Envoie un message ou un embed dans un salon')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    .addStringOption(opt =>
      opt.setName('message').setDescription('Le texte à envoyer').setRequired(true)
    )
    .addBooleanOption(opt =>
      opt.setName('embed').setDescription('Envoyer en tant qu\'embed ?')
    )
    .addStringOption(opt =>
      opt.setName('titre').setDescription('Titre de l\'embed (optionnel)')
    )
    .addChannelOption(opt =>
      opt.setName('salon').setDescription('Salon cible (par défaut : ici)')
    ),

  async execute(interaction) {
    const text = interaction.options.getString('message');
    const isEmbed = interaction.options.getBoolean('embed') ?? false;
    const title = interaction.options.getString('titre');
    const channel = interaction.options.getChannel('salon') ?? interaction.channel;

    if (isEmbed) {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setDescription(text)
        .setTimestamp();
      if (title) embed.setTitle(title);

      await channel.send({ embeds: [embed] });
    } else {
      await channel.send(text);
    }

    await interaction.reply({ content: '✅ Message envoyé !', ephemeral: true });
  },
};
