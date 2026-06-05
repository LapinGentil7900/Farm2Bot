module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n🤖 Connecté en tant que ${client.user.tag}`);
    console.log(`📡 Serveurs : ${client.guilds.cache.size}`);

    client.user.setPresence({
      activities: [{ name: '🎫 Support', type: 3 }], // type 3 = "Watching"
      status: 'online',
    });
  },
};
