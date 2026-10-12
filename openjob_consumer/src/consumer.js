require('dotenv').config();
const amqp = require('amqplib');
const ApplicationsService = require('./ApplicationsService');
const MailSender = require('./MailSender');
const Listener = require('./Listener');

const init = async () => {
  const applicationsService = new ApplicationsService();
  const mailSender = new MailSender();
  const listener = new Listener(applicationsService, mailSender);

  const host = process.env.RABBITMQ_HOST || 'localhost';
  const port = process.env.RABBITMQ_PORT || 5672;
  const user = process.env.RABBITMQ_USER || 'guest';
  const password = process.env.RABBITMQ_PASSWORD || 'guest';
  const amqpUrl =
    process.env.AMQP_URL ||
    process.env.RABBITMQ_SERVER ||
    `amqp://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}`;
  const queue = 'applications:queue';

  try {
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`Consumer berjalan dan mendengarkan antrean: ${queue}`);

    channel.consume(queue, async (message) => {
      if (message) {
        try {
          await listener.listen(message);
        } finally {
          channel.ack(message);
        }
      }
    });
  } catch (error) {
    console.error('Gagal menjalankan consumer RabbitMQ:', error.message);
  }
};

init();
