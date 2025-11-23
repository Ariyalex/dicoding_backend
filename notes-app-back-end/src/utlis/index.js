/* eslint-disable camelcase */
function mapDBToModel({
  id,
  title,
  body,
  tags,
  created_at,
  updated_at,
  username,
}) {
  const parsePgArray = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    // hapus kurung kurawal luar
    const inner = val.slice(1, -1);
    if (inner.length === 0) return [];
    // split lalu hilangkan tanda petik di tiap elemen
    return inner.split(",").map((s) => s.replace(/^"(.+)"$/, "$1"));
  };

  return {
    id,
    title,
    body,
    tags: parsePgArray(tags),
    createdAt: created_at,
    updatedAt: updated_at,
    username,
  };
}

module.exports = { mapDBToModel };
