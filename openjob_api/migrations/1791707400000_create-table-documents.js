exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    filename: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    original_name: {
      type: 'VARCHAR(255)',
      notNull: true,
    },
    size: {
      type: 'INTEGER',
      notNull: true,
    },
    created_at: {
      type: 'TIMESTAMP WITH TIME ZONE',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('documents', 'user_id');
};

exports.down = (pgm) => {
  pgm.dropTable('documents');
};
