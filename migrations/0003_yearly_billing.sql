ALTER TABLE torbox_users DROP COLUMN password;
ALTER TABLE torbox_users ADD COLUMN paid_until TEXT DEFAULT NULL;
ALTER TABLE torbox_users ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'active';
