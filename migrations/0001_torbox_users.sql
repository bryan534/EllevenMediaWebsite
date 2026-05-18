CREATE TABLE IF NOT EXISTS torbox_users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  auth_id    TEXT NOT NULL UNIQUE,
  api_token  TEXT NOT NULL DEFAULT '',
  password   TEXT NOT NULL DEFAULT '',
  note       TEXT NOT NULL DEFAULT '',
  added_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
