const { EmbedBuilder } = require('discord.js');
const { formatMessage } = require('../utils/helpers');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    const cfg = client.config.welcome;
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
      .setTimestamp();

    if (cfg.showAvatar) {
      embed.setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }));
    }

    await channel.send({ embeds: [embed] }).catch(err => {
      console.error(`❌ Impossible d'envoyer le message de bienvenue (salon: ${cfg.channelId}) :`, err.message);
    });

    // Auto-role
    const autoRole = client.config.autoRole;
    if (autoRole.enabled) {
      const role = member.guild.roles.cache.get(autoRole.roleId);
      if (role) await member.roles.add(role).catch(console.error);
    }

    // DM de bienvenue
    if (cfg.dmOnJoin && cfg.dmMessage) {
      const dm = formatMessage(cfg.dmMessage, vars);
      await member.send(dm).catch(() => {}); // ignore si DMs fermés
    }
  },
};
