const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class JobsService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async addJob({
    company_id,
    category_id,
    title,
    description = null,
    job_type = null,
    experience_level = null,
    location_type = null,
    location_city = null,
    salary_min = null,
    salary_max = null,
    is_salary_visible = true,
    status = 'open',
    owner_id = null,
  }) {
    const id = `job-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO jobs(
        id, company_id, category_id, title, description,
        job_type, experience_level, location_type, location_city,
        salary_min, salary_max, is_salary_visible, status, owner_id
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
      values: [
        id,
        company_id,
        category_id,
        title,
        description,
        job_type,
        experience_level,
        location_type,
        location_city,
        salary_min,
        salary_max,
        is_salary_visible !== undefined ? is_salary_visible : true,
        status || 'open',
        owner_id || null,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Job gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getJobs({ title, companyName }) {
    const isSearching = (title && title.trim() !== '') || (companyName && companyName.trim() !== '');

    let selectColumns = `
      j.id, 
      j.company_id, 
      j.category_id, 
      j.title, 
      j.description, 
      j.job_type, 
      j.experience_level, 
      j.location_type, 
      j.location_city, 
      j.salary_min, 
      j.salary_max, 
      j.is_salary_visible, 
      j.status
    `;

    if (isSearching) {
      selectColumns += `, c.name AS company_name, cat.name AS category_name`;
    }

    let baseQuery = `
      SELECT ${selectColumns}
      FROM jobs j
      LEFT JOIN companies c ON c.id = j.company_id
      LEFT JOIN categories cat ON cat.id = j.category_id
      WHERE 1=1
    `;

    const values = [];
    let paramIndex = 1;

    if (title && title.trim() !== '') {
      baseQuery += ` AND j.title ILIKE $${paramIndex}`;
      values.push(`%${title.trim()}%`);
      paramIndex++;
    }

    if (companyName && companyName.trim() !== '') {
      baseQuery += ` AND c.name ILIKE $${paramIndex}`;
      values.push(`%${companyName.trim()}%`);
      paramIndex++;
    }

    baseQuery += ' ORDER BY j.created_at DESC';

    const result = await this._pool.query(baseQuery, values);
    return result.rows;
  }

  async getJobsByCompanyId(companyId) {
    const query = {
      text: `
        SELECT 
          j.id, 
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
        FROM jobs j
        LEFT JOIN companies c ON c.id = j.company_id
        LEFT JOIN categories cat ON cat.id = j.category_id
        WHERE j.company_id = $1
        ORDER BY j.created_at DESC
      `,
      values: [companyId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getJobsByCategoryId(categoryId) {
    const query = {
      text: `
        SELECT 
          j.id, 
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
        FROM jobs j
        LEFT JOIN companies c ON c.id = j.company_id
        LEFT JOIN categories cat ON cat.id = j.category_id
        WHERE j.category_id = $1
        ORDER BY j.created_at DESC
      `,
      values: [categoryId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getJobById(id) {
    const query = {
      text: `
        SELECT 
          j.id, 
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
          j.status,
          j.created_at,
          j.updated_at
        FROM jobs j
        LEFT JOIN companies c ON c.id = j.company_id
        LEFT JOIN categories cat ON cat.id = j.category_id
        WHERE j.id = $1
      `,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Job tidak ditemukan');
    }

    return result.rows[0];
  }

  async editJobById(
    id,
    {
      company_id,
      category_id,
      title,
      description = null,
      job_type = null,
      experience_level = null,
      location_type = null,
      location_city = null,
      salary_min = null,
      salary_max = null,
      is_salary_visible = true,
      status = 'open',
    }
  ) {
    const query = {
      text: `UPDATE jobs SET
        company_id = $1, category_id = $2, title = $3, description = $4,
        job_type = $5, experience_level = $6, location_type = $7, location_city = $8,
        salary_min = $9, salary_max = $10, is_salary_visible = $11, status = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 RETURNING id`,
      values: [
        company_id,
        category_id,
        title,
        description,
        job_type,
        experience_level,
        location_type,
        location_city,
        salary_min,
        salary_max,
        is_salary_visible !== undefined ? is_salary_visible : true,
        status || 'open',
        id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui job. Id tidak ditemukan');
    }
  }

  async deleteJobById(id) {
    const query = {
      text: 'DELETE FROM jobs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Job gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = JobsService;
