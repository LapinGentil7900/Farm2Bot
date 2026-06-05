const { closeTicket, reopenTicket, deleteTicket, createTicket } = require('../utils/ticketManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(`Erreur commande /${interaction.commandName}:`, err);
        const reply = { content: '❌ Une erreur est survenue.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(reply);
        } else {
          await interaction.reply(reply);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const { customId } = interaction;
      const isTicketChannel = interaction.channel?.topic?.startsWith('ticket:');

      if (customId === 'ticket_open') {
        return createTicket(interaction);
      }

      if (customId === 'ticket_close') {
        if (!isTicketChannel) return interaction.reply({ content: '❌ Ce n\'est pas un ticket.', ephemeral: true });
        return closeTicket(interaction);
      }

      if (customId === 'ticket_reopen') {
        if (!isTicketChannel) return interaction.reply({ content: '❌ Ce n\'est pas un ticket.', ephemeral: true });
        return reopenTicket(interaction);
      }

      if (customId === 'ticket_delete') {
        if (!isTicketChannel) return interaction.reply({ content: '❌ Ce n\'est pas un ticket.', ephemeral: true });

        const staffRoleId = client.config.tickets.staffRoleId;
        const hasRole = interaction.member.roles.cache.has(staffRoleId);
        const isAdmin = interaction.member.permissions.has('Administrator');
        if (!hasRole && !isAdmin) {
          return interaction.reply({ content: '❌ Seul le staff peut supprimer un ticket.', ephemeral: true });
        }

        return deleteTicket(interaction);
      }
    }
  },
};
