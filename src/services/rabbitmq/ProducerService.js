const amqp = require('amqplib');

class ProducerService {
  constructor() {
    this._connection = null;
    this._channel = null;
  }

  async _getChannel() {
    if (this._channel) return this._channel;

    const host = process.env.RABBITMQ_HOST || 'localhost';
    const port = process.env.RABBITMQ_PORT || 5672;
    const user = process.env.RABBITMQ_USER || 'guest';
    const password = process.env.RABBITMQ_PASSWORD || 'guest';
    const amqpUrl =
      process.env.AMQP_URL || `amqp://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}`;

    this._connection = await amqp.connect(amqpUrl);
    this._connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err.message);
      this._connection = null;
      this._channel = null;
    });
    this._connection.on('close', () => {
      this._connection = null;
      this._channel = null;
    });

    this._channel = await this._connection.createChannel();
    return this._channel;
  }

  async sendMessage(queue, message) {
    try {
      const channel = await this._getChannel();
      await channel.assertQueue(queue, {
        durable: true,
      });

      const buffer = Buffer.from(typeof message === 'string' ? message : JSON.stringify(message));
      return channel.sendToQueue(queue, buffer, { persistent: true });
    } catch (error) {
      console.error(`Failed to publish message to queue ${queue}:`, error.message);
      // Reset channel/connection on failure
      this._channel = null;
      this._connection = null;
    }
  }
}

module.exports = ProducerService;
