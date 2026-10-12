const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class BookmarksService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async addBookmark({ userId, jobId }) {
    // Verify job exists
    const jobCheck = await this._pool.query({
      text: 'SELECT id FROM jobs WHERE id = $1',
      values: [jobId],
    });
    if (!jobCheck.rows.length) {
      throw new NotFoundError('Job tidak ditemukan');
    }

    const id = `bookmark-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO bookmarks(id, user_id, job_id) VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, jobId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Bookmark gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getBookmarksByUserId(userId) {
    const query = {
      text: `
        SELECT 
          b.id,
          b.user_id,
          b.job_id,
          b.created_at,
          j.title,
          j.description,
          j.company_id,
          c.name AS company_name,
          j.category_id,
          cat.name AS category_name,
          j.job_type,
          j.experience_level,
          j.location_type,
          j.location_city,
          j.salary_min,
          j.salary_max,
          j.is_salary_visible,
          j.status
        FROM bookmarks b
        JOIN jobs j ON j.id = b.job_id
        LEFT JOIN companies c ON c.id = j.company_id
        LEFT JOIN categories cat ON cat.id = j.category_id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getBookmarkById(jobId, id) {
    const query = {
      text: 'SELECT id, user_id, job_id, created_at FROM bookmarks WHERE id = $1 AND job_id = $2',
      values: [id, jobId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Bookmark tidak ditemukan');
    }

    return result.rows[0];
  }

  async deleteBookmarkByUserAndJob(userId, jobId) {
    const query = {
      text: 'DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2 RETURNING id',
      values: [userId, jobId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Bookmark gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = BookmarksService;
