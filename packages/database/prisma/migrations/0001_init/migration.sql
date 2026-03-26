-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sub";

-- CreateEnum
CREATE TYPE "sub"."UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'SALES_REP', 'VIEWER');

-- CreateEnum
CREATE TYPE "sub"."InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateTable
CREATE TABLE "sub"."users" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "external_id" TEXT,
    "auth_provider_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "avatar_url" TEXT,
    "phone_number" TEXT,
    "role" "sub"."UserRole" NOT NULL DEFAULT 'SALES_REP',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_signed_in_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),
    "synced_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."invitations" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "sub"."UserRole" NOT NULL DEFAULT 'SALES_REP',
    "status" "sub"."InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invited_by_id" INTEGER NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."teams" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."team_members" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_public_id_key" ON "sub"."users"("public_id");
CREATE UNIQUE INDEX "users_auth_provider_id_key" ON "sub"."users"("auth_provider_id");
CREATE UNIQUE INDEX "users_email_key" ON "sub"."users"("email");
CREATE INDEX "users_public_id_idx" ON "sub"."users"("public_id");
CREATE INDEX "users_external_id_idx" ON "sub"."users"("external_id");
CREATE INDEX "users_email_idx" ON "sub"."users"("email");
CREATE INDEX "users_auth_provider_id_idx" ON "sub"."users"("auth_provider_id");
CREATE INDEX "users_is_active_idx" ON "sub"."users"("is_active");
CREATE INDEX "users_deleted_at_idx" ON "sub"."users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_public_id_key" ON "sub"."invitations"("public_id");
CREATE UNIQUE INDEX "invitations_token_key" ON "sub"."invitations"("token");
CREATE INDEX "invitations_token_idx" ON "sub"."invitations"("token");
CREATE INDEX "invitations_email_idx" ON "sub"."invitations"("email");
CREATE INDEX "invitations_status_idx" ON "sub"."invitations"("status");
CREATE INDEX "invitations_invited_by_id_idx" ON "sub"."invitations"("invited_by_id");
CREATE INDEX "invitations_expires_at_idx" ON "sub"."invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "teams_public_id_key" ON "sub"."teams"("public_id");
CREATE INDEX "teams_public_id_idx" ON "sub"."teams"("public_id");
CREATE INDEX "teams_deleted_at_idx" ON "sub"."teams"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "team_members_team_id_user_id_key" ON "sub"."team_members"("team_id", "user_id");
CREATE INDEX "team_members_team_id_idx" ON "sub"."team_members"("team_id");
CREATE INDEX "team_members_user_id_idx" ON "sub"."team_members"("user_id");
CREATE INDEX "team_members_deleted_at_idx" ON "sub"."team_members"("deleted_at");

-- AddForeignKey
ALTER TABLE "sub"."invitations" ADD CONSTRAINT "invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "sub"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub"."team_members" ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "sub"."teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub"."team_members" ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "sub"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateView
CREATE VIEW "sub"."visible_users" AS
SELECT * FROM "sub"."users" WHERE "deleted_at" IS NULL;

-- CreateView
CREATE VIEW "sub"."visible_invitations" AS
SELECT * FROM "sub"."invitations" WHERE "deleted_at" IS NULL;

-- CreateView
CREATE VIEW "sub"."visible_teams" AS
SELECT * FROM "sub"."teams" WHERE "deleted_at" IS NULL;

-- CreateView
CREATE VIEW "sub"."visible_team_members" AS
SELECT * FROM "sub"."team_members" WHERE "deleted_at" IS NULL;
