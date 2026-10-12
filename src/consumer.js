require('dotenv').config();
const amqp = require('amqplib');
const { Pool } = require('pg');
const MailService = require('./services/mail/MailService');

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
});

const mailService = new MailService();

const init = async () => {
  const host = process.env.RABBITMQ_HOST || 'localhost';
  const port = process.env.RABBITMQ_PORT || 5672;
  const user = process.env.RABBITMQ_USER || 'guest';
  const password = process.env.RABBITMQ_PASSWORD || 'guest';
  const amqpUrl =
    process.env.AMQP_URL || `amqp://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}`;
  const queue = 'applications:queue';

  try {
    const connection = await amqp.connect(amqpUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    console.log(`Consumer berjalan dan mendengarkan antrean: ${queue}`);

    channel.consume(queue, async (message) => {
      if (!message) return;

      try {
        let payload;
        try {
          payload = JSON.parse(message.content.toString());
        } catch {
          payload = message.content.toString();
        }

        const applicationId =
          typeof payload === 'object'
            ? payload.application_id || payload.applicationId || payload.id
            : payload;

        console.log(`Memproses pesan untuk lamaran ID: ${applicationId}`);

        // Query database to get applicant details, job, and job owner
        const query = {
          text: `
            SELECT 
              a.id AS application_id,
              a.created_at AS application_date,
              applicant.name AS applicant_name,
              applicant.email AS applicant_email,
              j.title AS job_title,
              COALESCE(job_owner.email, comp_owner.email, admin_user.email) AS owner_email,
              COALESCE(job_owner.name, comp_owner.name, admin_user.name) AS owner_name
            FROM applications a
            JOIN users applicant ON applicant.id = a.user_id
            JOIN jobs j ON j.id = a.job_id
            LEFT JOIN companies c ON c.id = j.company_id
            LEFT JOIN users job_owner ON job_owner.id = j.owner_id
            LEFT JOIN users comp_owner ON comp_owner.id = c.owner_id
            LEFT JOIN users admin_user ON admin_user.role = 'admin'
            WHERE a.id = $1
          `,
          values: [applicationId],
        };

        const result = await pool.query(query);

        if (!result.rows.length) {
          console.warn(`Data lamaran ${applicationId} tidak ditemukan di database.`);
          channel.ack(message);
          return;
        }

        const data = result.rows[0];

        if (!data.owner_email) {
          console.warn(`Pemilik lowongan untuk pekerjaan ${data.job_title} tidak memiliki email.`);
          channel.ack(message);
          return;
        }

        const formattedDate = new Date(data.application_date).toLocaleString('id-ID', {
          timeZone: 'Asia/Jakarta',
          dateStyle: 'full',
          timeStyle: 'medium',
        });

        const subject = `Notifikasi Lamaran Baru: ${data.job_title}`;
        const text = `Halo ${data.owner_name || 'Job Owner'},\n\n` +
          `Ada kandidat baru yang melamar pekerjaan "${data.job_title}".\n\n` +
          `Informasi Pelamar:\n` +
          `- Nama pelamar: ${data.applicant_name}\n` +
          `- Email pelamar: ${data.applicant_email}\n` +
          `- Tanggal lamaran: ${formattedDate} (${data.application_date})\n\n` +
          `Salam,\nTim OpenJob`;

        const html = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Notifikasi Lamaran Baru</h2>
            <p>Halo <strong>${data.owner_name || 'Job Owner'}</strong>,</p>
            <p>Ada kandidat baru yang melamar lowongan lowongan pekerjaan <strong>${data.job_title}</strong>.</p>
            <h3>Detail Pelamar:</h3>
            <ul>
              <li><strong>Nama pelamar:</strong> ${data.applicant_name}</li>
              <li><strong>Email pelamar:</strong> ${data.applicant_email}</li>
              <li><strong>Tanggal lamaran:</strong> ${formattedDate} (${data.application_date})</li>
            </ul>
            <p>Silakan login ke aplikasi OpenJob untuk meninjau lamaran ini.</p>
            <br/>
            <p>Salam hangat,<br/>Tim OpenJob</p>
          </div>
        `;

        await mailService.sendEmail(data.owner_email, {
          subject,
          text,
          html,
        });

        console.log(`Email notifikasi berhasil dikirim ke pemilik lowongan: ${data.owner_email}`);
        channel.ack(message);
      } catch (err) {
        console.error('Gagal memproses pesan:', err.message);
        // Acknowledge to prevent infinite requeue loop on bad message
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error('Gagal menjalankan consumer RabbitMQ:', error.message);
  }
};

init();
