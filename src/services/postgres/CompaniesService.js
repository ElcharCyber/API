const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CompaniesService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async addCompany({ name, location, description, owner_id = null }) {
    const id = `company-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO companies(id, name, location, description, owner_id) VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, location, description || null, owner_id || null],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Company gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getCompanies() {
    const result = await this._pool.query(
      'SELECT id, name, location, description, created_at, updated_at FROM companies'
    );
    return result.rows;
  }

  async getCompanyById(id) {
    const query = {
      text: 'SELECT id, name, location, description FROM companies WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Company tidak ditemukan');
    }

    return result.rows[0];
  }

  async editCompanyById(id, { name, location, description }) {
    const query = {
      text: 'UPDATE companies SET name = $1, location = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id',
      values: [name, location, description || null, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui company. Id tidak ditemukan');
    }
  }

  async deleteCompanyById(id) {
    const query = {
      text: 'DELETE FROM companies WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Company gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = CompaniesService;
