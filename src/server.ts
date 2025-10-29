import type { Server } from 'http';
import app from './app.js';
import sequelize from './config/database.js';
import { env } from './utils/env.js';

let server: Server;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();

    // Start server
    server = app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 */
function gracefulShutdown(_signal: string) {

  // Stop accepting new connections
  if (server) {
    server.close(async () => {

      try {
        // Close database connection
        await sequelize.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGTERM', () => void gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => void gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught exception:', error);
  void gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled rejection:', reason);
  void gracefulShutdown('unhandledRejection');
});

// Start the server
// eslint-disable-next-line @typescript-eslint/no-floating-promises
startServer();
