exports.up = (pgm) => {
  pgm.addColumn('companies', {
    owner_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'SET NULL',
      notNull: false,
    },
  });

  pgm.addColumn('jobs', {
    owner_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'SET NULL',
      notNull: false,
    },
  });

  pgm.createIndex('companies', 'owner_id');
  pgm.createIndex('jobs', 'owner_id');
};

exports.down = (pgm) => {
  pgm.dropColumn('jobs', 'owner_id');
  pgm.dropColumn('companies', 'owner_id');
};
