const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class ApplicationsService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async addApplication({ userId, jobId, status = 'pending' }) {
    // Verify job exists
    const jobCheck = await this._pool.query({
      text: 'SELECT id FROM jobs WHERE id = $1',
      values: [jobId],
    });
    if (!jobCheck.rows.length) {
      throw new NotFoundError('Job tidak ditemukan');
    }

    // Verify user exists
    const userCheck = await this._pool.query({
      text: 'SELECT id FROM users WHERE id = $1',
      values: [userId],
    });
    if (!userCheck.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }

    // Check duplicate application
    const dupCheck = await this._pool.query({
      text: 'SELECT id FROM applications WHERE user_id = $1 AND job_id = $2',
      values: [userId, jobId],
    });
    if (dupCheck.rows.length) {
      throw new InvariantError('Lamaran untuk pekerjaan ini sudah pernah dibuat (duplicate application)');
    }

    const id = `application-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO applications(id, user_id, job_id, status) VALUES($1, $2, $3, $4) RETURNING id, user_id, job_id, status',
      values: [id, userId, jobId, status || 'pending'],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lamaran gagal diajukan');
    }

    return result.rows[0];
  }

  async getApplications() {
    const query = {
      text: `
        SELECT 
          a.id, 
          a.user_id, 
          a.job_id, 
          a.status, 
          a.created_at, 
          a.updated_at,
          j.title, 
          j.company_id, 
          j.category_id, 
          j.job_type, 
          j.experience_level, 
          j.location_type, 
          j.location_city
        FROM applications a
        LEFT JOIN jobs j ON j.id = a.job_id
        ORDER BY a.created_at DESC
      `,
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getApplicationById(id) {
    const query = {
      text: 'SELECT id, user_id, job_id, status, created_at FROM applications WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lamaran tidak ditemukan');
    }

    return result.rows[0];
  }

  async getApplicationsByUserId(userId) {
    const query = {
      text: 'SELECT id, user_id, job_id, status, created_at FROM applications WHERE user_id = $1 ORDER BY created_at DESC',
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getProfileApplicationsByUserId(userId) {
    const query = {
      text: `
        SELECT 
          a.id, 
          a.user_id, 
          a.job_id, 
          a.status, 
          a.created_at, 
          a.updated_at,
          j.title, 
          j.company_id, 
          c.name AS company_name,
          j.category_id, 
          cat.name AS category_name,
          j.job_type, 
          j.experience_level, 
          j.location_type, 
          j.location_city
        FROM applications a
        LEFT JOIN jobs j ON j.id = a.job_id
        LEFT JOIN companies c ON c.id = j.company_id
        LEFT JOIN categories cat ON cat.id = j.category_id
        WHERE a.user_id = $1
        ORDER BY a.created_at DESC
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getApplicationsByJobId(jobId) {
    const query = {
      text: 'SELECT id, user_id, job_id, status, created_at FROM applications WHERE job_id = $1 ORDER BY created_at DESC',
      values: [jobId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async editApplicationStatusById(id, status) {
    const query = {
      text: 'UPDATE applications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, user_id, job_id, status',
      values: [status, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui status lamaran. Id tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteApplicationById(id) {
    const query = {
      text: 'DELETE FROM applications WHERE id = $1 RETURNING id, user_id, job_id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lamaran gagal dihapus. Id tidak ditemukan');
    }

    return result.rows[0];
  }
}

module.exports = ApplicationsService;
