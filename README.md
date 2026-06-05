# 🤖 Discord Bot

Bot Discord complet avec messages de bienvenue/au revoir, système de tickets et commandes utilitaires.

---

## 📦 Installation

```bash
npm install
```

---

## ⚙️ Configuration

Remplis le fichier `config/config.json` avec tes valeurs :

| Clé | Description |
|-----|-------------|
| `token` | Token de ton bot (Discord Developer Portal) |
| `clientId` | ID de l'application bot |
| `guildId` | ID de ton serveur Discord |

### Variables de message disponibles

Dans les messages `welcome` et `goodbye` :

| Variable | Valeur |
|----------|--------|
| `{user}` | Mention de l'utilisateur |
| `{username}` | Pseudo de l'utilisateur |
| `{server}` | Nom du serveur |
| `{memberCount}` | Nombre de membres |

---

## 🚀 Démarrage

**1. Déployer les commandes slash (à faire une seule fois ou après modification)**
```bash
npm run deploy
```

**2. Lancer le bot**
```bash
npm start
# ou en mode développement avec auto-restart :
npm run dev
```

---

## 🎫 Système de tickets

### Catégories Discord requises
Crée 3 catégories sur ton serveur et renseigne leurs IDs dans `config.json` :
- **En attente** → `categoryWaiting`
- **Ouvert** → `categoryOpen`
- **Fermé** → `categoryClosed`

### Panel
Utilise `/ticket panel` dans le salon de ton choix pour créer le panel.

### Flux d'un ticket
```
Création → 📂 En attente
            ↓ (staff répond)
         📂 Ouvert  ←──────────────┐
            ↓ (bouton Fermer)       │
         📂 Fermé                   │
            ↓ (bouton Rouvrir) ─────┘
            ↓ (bouton Supprimer)
         ❌ Salon supprimé (avec transcript)
```

---

## 📋 Commandes disponibles

| Commande | Permission | Description |
|----------|-----------|-------------|
| `/ping` | Tout le monde | Latence du bot |
| `/userinfo [user]` | Tout le monde | Infos d'un utilisateur |
| `/say` | Manage Messages | Envoyer un message/embed |
| `/ticket panel` | Manage Guild | Envoyer le panel de ticket |
| `/ticket add @user` | Manage Guild | Ajouter quelqu'un à un ticket |
| `/ticket remove @user` | Manage Guild | Retirer quelqu'un d'un ticket |

---

## 🗂️ Structure du projet

```
discord-bot/
├── config/
│   └── config.json          ← Toute la configuration
├── src/
│   ├── index.js             ← Point d'entrée
│   ├── deploy-commands.js   ← Déploie les slash commands
│   ├── commands/
│   │   ├── ticket.js        ← Gestion des tickets
│   │   ├── say.js           ← Envoi de messages
│   │   ├── userinfo.js      ← Infos utilisateur
│   │   └── ping.js          ← Ping
│   ├── events/
│   │   ├── ready.js         ← Bot prêt
│   │   ├── guildMemberAdd.js    ← Bienvenue
│   │   ├── guildMemberRemove.js ← Au revoir
│   │   └── interactionCreate.js ← Commandes & boutons
│   └── utils/
│       ├── helpers.js       ← Fonctions utilitaires
│       └── ticketManager.js ← Logique des tickets
└── package.json
```

---

## 🔧 Obtenir les IDs Discord

Active le **Mode Développeur** dans Paramètres → Avancés → Mode développeur, puis fais clic droit sur n'importe quel élément pour copier son ID.
