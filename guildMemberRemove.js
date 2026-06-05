const { EmbedBuilder } = require('discord.js');
const { formatMessage } = require('../utils/helpers');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member, client) {
    const cfg = client.config.goodbye;
    if (!cfg.enabled) return;

    const channel = member.guild.channels.cache.get(cfg.channelId);
    if (!channel) return;

    const vars = {
      user: `<@${member.id}>`,
      username: member.user.username,
      server: member.guild.name,
      memberCount: member.guild.memberCount,
    };

    const embed = new EmbedBuilder()
      .setColor(cfg.embedColor)
      .setTitle(cfg.title)
      .setDescription(formatMessage(cfg.message, vars))
      .setFooter({ text: cfg.footer })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    await channel.send({ embeds: [embed] }).catch(err => {
      console.error(`❌ Impossible d'envoyer le message d'au revoir (salon: ${cfg.channelId}) :`, err.message);
    });
  },
};
