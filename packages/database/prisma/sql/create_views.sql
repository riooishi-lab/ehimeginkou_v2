-- Create Visible Views (論理削除されていないデータのみを表示)

CREATE VIEW "sub"."visible_users" AS
SELECT * FROM "sub"."users" WHERE deleted_at IS NULL;

CREATE VIEW "sub"."visible_invitations" AS
SELECT * FROM "sub"."invitations" WHERE deleted_at IS NULL;

CREATE VIEW "sub"."visible_teams" AS
SELECT * FROM "sub"."teams" WHERE deleted_at IS NULL;

CREATE VIEW "sub"."visible_team_members" AS
SELECT * FROM "sub"."team_members" WHERE deleted_at IS NULL;

CREATE VIEW "sub"."visible_videos" AS
SELECT * FROM "sub"."videos" WHERE deleted_at IS NULL;

CREATE VIEW "sub"."visible_students" AS
SELECT * FROM "sub"."students" WHERE deleted_at IS NULL;
