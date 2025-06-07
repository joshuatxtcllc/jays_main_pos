
import { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } from 'discord.js';

class DiscordBot {
  private client: Client;
  private token: string;
  private applicationId: string;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    this.token = process.env.DISCORD_BOT_TOKEN || '';
    this.applicationId = process.env.DISCORD_APPLICATION_ID || '';

    this.setupEventHandlers();
    this.setupCommands();
  }

  private setupEventHandlers() {
    this.client.once('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user?.tag}!`);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'order-status') {
        const orderId = interaction.options.getString('order-id');
        await interaction.reply(`Checking status for order: ${orderId}`);
        // Add your order status logic here
      }

      if (interaction.commandName === 'frame-quote') {
        const dimensions = interaction.options.getString('dimensions');
        await interaction.reply(`Getting quote for frame dimensions: ${dimensions}`);
        // Add your pricing logic here
      }

      if (interaction.commandName === 'production-status') {
        await interaction.reply('Checking production queue status...');
        // TODO: Integrate with your production kanban
      }

      if (interaction.commandName === 'help') {
        const helpText = `
**Available Commands:**
• \`/order-status <order-id>\` - Check order status
• \`/frame-quote <dimensions>\` - Get frame quote
• \`/production-status\` - View production queue
• \`/help\` - Show this help message
        `;
        await interaction.reply(helpText);
      }
    });
  }

  private async setupCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('order-status')
        .setDescription('Check the status of a framing order')
        .addStringOption(option =>
          option.setName('order-id')
            .setDescription('The order ID to check')
            .setRequired(true)
        ),
      new SlashCommandBuilder()
        .setName('frame-quote')
        .setDescription('Get a quick frame quote')
        .addStringOption(option =>
          option.setName('dimensions')
            .setDescription('Frame dimensions (e.g., 16x20)')
            .setRequired(true)
        ),
      new SlashCommandBuilder()
        .setName('production-status')
        .setDescription('Check production queue status'),
      new SlashCommandBuilder()
        .setName('help')
        .setDescription('Show available commands and help')
    ].map(command => command.toJSON());

    const rest = new REST().setToken(this.token);

    try {
      console.log('Started refreshing Discord application (/) commands.');

      await rest.put(
        Routes.applicationCommands(this.applicationId),
        { body: commands }
      );

      console.log('Successfully reloaded Discord application (/) commands.');
    } catch (error) {
      console.error('Error registering Discord commands:', error);
    }
  }

  public async start() {
    if (!this.token) {
      console.error('Discord bot token not found. Please set DISCORD_BOT_TOKEN environment variable.');
      return;
    }

    try {
      await this.client.login(this.token);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  }

  public async sendNotification(channelId: string, message: string) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        await channel.send(message);
      }
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  public async sendOrderUpdate(channelId: string, orderId: string, status: string) {
    const message = `🔔 **Order Update**\nOrder #${orderId} status changed to: **${status}**`;
    await this.sendNotification(channelId, message);
  }

  public async sendProductionAlert(channelId: string, message: string) {
    const alertMessage = `⚠️ **Production Alert**\n${message}`;
    await this.sendNotification(channelId, alertMessage);
  }

  public async stop() {
    this.client.destroy();
  }
}

export default DiscordBot;
