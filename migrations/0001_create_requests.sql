-- Service requests table. Matches the columns in data/seed-requests.csv, plus an id.
CREATE TABLE IF NOT EXISTS requests (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at     TEXT NOT NULL,
  requester_name TEXT NOT NULL CHECK (length(trim(requester_name)) > 0),
  location       TEXT NOT NULL CHECK (location IN ('Minneapolis', 'Chicago', 'Denver', 'Austin')),
  description    TEXT NOT NULL CHECK (length(trim(description)) > 0 AND length(description) <= 500),
  priority       TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status         TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Complete'))
);

CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests (created_at);
