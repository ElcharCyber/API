const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class CategoriesService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async addCategory({ name }) {
    const id = `category-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO categories(id, name) VALUES($1, $2) RETURNING id',
      values: [id, name],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Category gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getCategories() {
    const result = await this._pool.query(
      'SELECT id, name, created_at, updated_at FROM categories'
    );
    return result.rows;
  }

  async getCategoryById(id) {
    const query = {
      text: 'SELECT id, name, created_at, updated_at FROM categories WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Category tidak ditemukan');
    }

    return result.rows[0];
  }

  async editCategoryById(id, { name }) {
    const query = {
      text: 'UPDATE categories SET name = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id',
      values: [name, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui category. Id tidak ditemukan');
    }
  }

  async deleteCategoryById(id) {
    const query = {
      text: 'DELETE FROM categories WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Category gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = CategoriesService;
