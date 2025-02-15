-- USERS TABLE --
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL,
	username VARCHAR(100) NOT NULL UNIQUE,
	password VARCHAR(100) NOT NULL
);

-- USER SECRETS TABLE --
CREATE TABLE user_secrets (
	id SERIAL PRIMARY KEY,
	secret TEXT NOT NULL,
	user_id INTEGER REFERENCES users(id)
);

-- SESSION TABLE FOR THE SESSION DATASTORE --
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);

ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

CREATE INDEX "IDX_session_expire" ON "session" ("expire");