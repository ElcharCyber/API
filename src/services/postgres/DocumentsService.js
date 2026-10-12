const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class DocumentsService {
  constructor() {
    this._pool = new Pool({
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
      database: process.env.PGDATABASE,
      host: process.env.PGHOST,
      port: process.env.PGPORT,
    });
  }

  async addDocument({ userId, filename, originalName, size }) {
    const id = `document-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO documents(id, user_id, filename, original_name, size)
             VALUES($1, $2, $3, $4, $5)
             RETURNING id, filename, original_name, size`,
      values: [id, userId, filename, originalName, size],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Dokumen gagal disimpan');
    }

    const doc = result.rows[0];
    return {
      documentId: doc.id,
      filename: doc.filename,
      originalName: doc.original_name,
      size: Number(doc.size),
    };
  }

  async getDocuments() {
    const query = {
      text: `SELECT id, user_id, filename, original_name, size, created_at
             FROM documents
             ORDER BY created_at DESC`,
    };

    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      filename: row.filename,
      originalName: row.original_name,
      original_name: row.original_name,
      size: Number(row.size),
      created_at: row.created_at,
    }));
  }

  async getDocumentById(id) {
    const query = {
      text: `SELECT id, user_id, filename, original_name, size, created_at
             FROM documents
             WHERE id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Dokumen tidak ditemukan');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      filename: row.filename,
      originalName: row.original_name,
      original_name: row.original_name,
      size: Number(row.size),
      created_at: row.created_at,
    };
  }

  async deleteDocumentById(id) {
    const document = await this.getDocumentById(id);

    // Delete file from disk if it exists
    const filePath = path.resolve(__dirname, '../../../uploads/documents', document.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete physical file:', err.message);
      }
    }

    const query = {
      text: 'DELETE FROM documents WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Dokumen gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = DocumentsService;
