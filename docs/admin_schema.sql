-- Core enums
CREATE TYPE user_role AS ENUM ('ADMIN', 'INVESTOR', 'DEVELOPER');
CREATE TYPE property_status AS ENUM ('PENDING', 'LIVE', 'SOLD');
CREATE TYPE inquiry_status AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- Users table
CREATE TABLE IF NOT EXISTS users (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	role user_role NOT NULL DEFAULT 'INVESTOR',
	is_verified BOOLEAN NOT NULL DEFAULT FALSE,
	company_id UUID,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Companies (Developers)
CREATE TABLE IF NOT EXISTS companies (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	name TEXT NOT NULL,
	website TEXT,
	contact_email TEXT,
	contact_phone TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK from users to companies
ALTER TABLE users
	ADD CONSTRAINT fk_users_company
	FOREIGN KEY (company_id)
	REFERENCES companies(id)
	ON DELETE SET NULL;

-- Properties
CREATE TABLE IF NOT EXISTS properties (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	title TEXT NOT NULL,
	description TEXT,
	developer_id UUID NOT NULL,
	status property_status NOT NULL DEFAULT 'PENDING',
	is_verified BOOLEAN NOT NULL DEFAULT FALSE,
	price NUMERIC(12,2),
	location TEXT,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE properties
	ADD CONSTRAINT fk_properties_developer
	FOREIGN KEY (developer_id)
	REFERENCES companies(id)
	ON DELETE CASCADE;

-- Media linked to properties
CREATE TABLE IF NOT EXISTS media (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	property_id UUID NOT NULL,
	url TEXT NOT NULL,
	alt TEXT,
	position INT NOT NULL DEFAULT 0,
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE media
	ADD CONSTRAINT fk_media_property
	FOREIGN KEY (property_id)
	REFERENCES properties(id)
	ON DELETE CASCADE;

-- Inquiries (Leads)
CREATE TABLE IF NOT EXISTS inquiries (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	investor_id UUID NOT NULL,
	property_id UUID NOT NULL,
	message TEXT,
	status inquiry_status NOT NULL DEFAULT 'NEW',
	created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
	updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE inquiries
	ADD CONSTRAINT fk_inquiries_investor
	FOREIGN KEY (investor_id)
	REFERENCES users(id)
	ON DELETE CASCADE;

ALTER TABLE inquiries
	ADD CONSTRAINT fk_inquiries_property
	FOREIGN KEY (property_id)
	REFERENCES properties(id)
	ON DELETE CASCADE;

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_developer ON properties(developer_id);
CREATE INDEX IF NOT EXISTS idx_media_property ON media(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_property ON inquiries(property_id);
