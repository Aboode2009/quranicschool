ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS can_access_finances boolean NOT NULL DEFAULT false;
