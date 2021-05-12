CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS assets (
  id uuid DEFAULT uuid_generate_v1 (),
  created_on TIMESTAMP NOT NULL,
  name VARCHAR(100),
  ticker VARCHAR(10) NOT NULL UNIQUE,
  PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS external_price_symbols (
  source VARCHAR(100),
  symbol VARCHAR(20),
  asset_id UUID NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets (id),
  PRIMARY KEY (asset_id, source)
);
CREATE TABLE IF NOT EXISTS prices (
  created_on TIMESTAMP NOT NULL,
  date TIMESTAMP NOT NULL,
  low NUMERIC(10,2) NOT NULL,
  high NUMERIC(10,2) NOT NULL,
  open NUMERIC(10,2) NOT NULL,
  close NUMERIC(10,2) NOT NULL,
  asset_id UUID NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets (id),
  PRIMARY KEY (asset_id, date)
);
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT uuid_generate_v1 (),
  created_on TIMESTAMP NOT NULL,
  username VARCHAR(100) NOT NULL,
  pass_hash VARCHAR(100) NOT NULL,
  role VARCHAR(5) NOT NULL,
  PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_on TIMESTAMP NOT NULL,
  FOREIGN KEY (id) REFERENCES users (id)
);
CREATE TABLE IF NOT EXISTS wallets (
  id serial PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  owner_id UUID NOT NULL,
  created_on TIMESTAMP NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES investors (id)
);
CREATE TABLE IF NOT EXISTS positions (
  id serial PRIMARY KEY,
  asset_id UUID NOT NULL,
  wallet_id INT NOT NULL,
  created_on TIMESTAMP NOT NULL,
  FOREIGN KEY (asset_id) REFERENCES assets (id),
  FOREIGN KEY (wallet_id) REFERENCES wallets (id)
);
CREATE TABLE IF NOT EXISTS operations (
  id serial PRIMARY KEY,
  date TIMESTAMPTZ NOT NULL,
  quantity INT NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  position_id INT NOT NULL,
  created_on TIMESTAMP NOT NULL,
  FOREIGN KEY (position_id) REFERENCES positions (id)
);
