import { logger } from './lib';
import client from './lib/discordClient';
import { registerEvents } from './events';

async function main() {
  try {
    logger.info('Application started');
    
    registerEvents(client);
    logger.info('Events registered');

    await client.login(process.env.DISCORD_TOKEN);
    
  } catch (error) {
    logger.error('Application error:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error('Unhandled error:', error);
  process.exit(1);
});
