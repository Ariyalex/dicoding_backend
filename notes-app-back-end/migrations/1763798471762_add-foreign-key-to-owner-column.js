/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(
    "insert into users(id, username, password, fullname) values ('old_notes','old_notes','old_notes','old_notes')"
  );

  pgm.sql("update notes set owner = 'old_notes' where owner is NULL");

  pgm.addConstraint(
    "notes",
    "fk_notes.owner_users.id",
    "foreign key(owner) references users(id) on delete cascade"
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint("notes", "fk_notes.owner_users.id");

  pgm.sql("update notes set owner = NULL where owner = 'old_notes'");

  pgm.sql("delete from users where id = 'old_notes'");
};
