CREATE TABLE IF NOT EXISTS bookings (
 id TEXT PRIMARY KEY,
 booking_ref TEXT NOT NULL UNIQUE,
 created_at TEXT NOT NULL,
 company TEXT,
 cphone TEXT,
 cemail TEXT,
 msme TEXT,
 name TEXT NOT NULL,
 phone TEXT NOT NULL,
 email TEXT,
 idtype TEXT,
 idno TEXT,
 service TEXT NOT NULL,
 date TEXT,
 pax INTEGER DEFAULT 1,
 details TEXT,
 payment_note TEXT,
 status TEXT NOT NULL DEFAULT 'New',
 vehicle TEXT,
 driver TEXT,
 driver_phone TEXT,
 price REAL DEFAULT 0,
 advance REAL DEFAULT 0,
 received REAL DEFAULT 0,
 paid REAL DEFAULT 0,
 mode TEXT,
 paidto TEXT,
 gst REAL DEFAULT 0,
 admin_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(phone);
CREATE TABLE IF NOT EXISTS device_tokens (
 token TEXT PRIMARY KEY,
 user_id TEXT,
 role TEXT,
 active INTEGER NOT NULL DEFAULT 1,
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_device_tokens_active ON device_tokens(active);
