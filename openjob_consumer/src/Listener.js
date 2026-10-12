class Listener {
  constructor(applicationsService, mailSender) {
    this._applicationsService = applicationsService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
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

      const data = await this._applicationsService.getApplicationDetails(applicationId);

      if (!data) {
        console.warn(`Data lamaran ${applicationId} tidak ditemukan di database.`);
        return;
      }

      if (!data.owner_email) {
        console.warn(`Pemilik lowongan untuk pekerjaan "${data.job_title}" tidak memiliki email.`);
        return;
      }

      const formattedDate = new Date(data.application_date).toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'full',
        timeStyle: 'medium',
      });

      const subject = `Notifikasi Lamaran Baru: ${data.job_title}`;
      const text =
        `Halo ${data.owner_name || 'Job Owner'},\n\n` +
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
          <p>Ada kandidat baru yang melamar lowongan pekerjaan <strong>${data.job_title}</strong>.</p>
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

      const result = await this._mailSender.sendEmail(data.owner_email, {
        subject,
        text,
        html,
      });

      console.log(`Email notifikasi berhasil dikirim ke: ${data.owner_email} (messageId: ${result.messageId || 'sent'})`);
    } catch (error) {
      console.error('Gagal memproses pesan:', error.message);
    }
  }
}

module.exports = Listener;
