exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    company_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"companies"',
      onDelete: 'CASCADE',
    },
    category_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"categories"',
      onDelete: 'CASCADE',
    },
    title: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    description: {
      type: 'TEXT',
      notNull: false,
    },
    job_type: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
    experience_level: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
    location_type: {
      type: 'VARCHAR(50)',
      notNull: false,
    },
    location_city: {
      type: 'VARCHAR(255)',
      notNull: false,
    },
    salary_min: {
      type: 'BIGINT',
      notNull: false,
    },
    salary_max: {
      type: 'BIGINT',
      notNull: false,
    },
    is_salary_visible: {
      type: 'BOOLEAN',
      notNull: false,
      default: true,
    },
    status: {
      type: 'VARCHAR(50)',
      notNull: false,
      default: 'open',
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('jobs', 'company_id');
  pgm.createIndex('jobs', 'category_id');
};

exports.down = (pgm) => {
  pgm.dropTable('jobs');
};
