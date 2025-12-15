const { Pool } = require("pg");

class NotesService {
  constructor() {
    this._pool = new Pool();
  }

  async getNotes(userId) {
    const query = {
      text: `
        select n.* from notes n
        left join collaborations c on c.note_id = n.id
        where n.owner = $1 or c.user_id = $1
        group by n.id`,
      values: [userId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = NotesService;
