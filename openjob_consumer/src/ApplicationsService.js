const { Pool } = require('pg');

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

  async getApplicationDetails(applicationId) {
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

    const result = await this._pool.query(query);
    return result.rows[0];
  }
}

module.exports = ApplicationsService;
