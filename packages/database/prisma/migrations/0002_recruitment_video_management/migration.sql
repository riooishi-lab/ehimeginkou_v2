-- CreateEnum
CREATE TYPE "sub"."VideoCategory" AS ENUM ('GOAL_APPEAL', 'PEOPLE_APPEAL', 'ACTIVITY_APPEAL', 'CONDITION_APPEAL', 'BRIEFING');

-- CreateEnum
CREATE TYPE "sub"."WatchEventType" AS ENUM ('PLAY', 'PAUSE', 'SEEK', 'ENDED', 'HEARTBEAT');

-- CreateTable
CREATE TABLE "sub"."videos" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "sub"."VideoCategory" NOT NULL,
    "subcategory" TEXT,
    "duration_sec" INTEGER,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_pinned" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."students" (
    "id" SERIAL NOT NULL,
    "public_id" TEXT NOT NULL,
    "ats_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "university" TEXT,
    "department" TEXT,
    "token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."watch_events" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "video_id" INTEGER NOT NULL,
    "event_type" "sub"."WatchEventType" NOT NULL,
    "position_sec" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "session_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."student_memos" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "author_email" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "student_memos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub"."audit_logs" (
    "id" SERIAL NOT NULL,
    "actor_email" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "videos_public_id_key" ON "sub"."videos"("public_id");
CREATE INDEX "videos_public_id_idx" ON "sub"."videos"("public_id");
CREATE INDEX "videos_category_idx" ON "sub"."videos"("category");
CREATE INDEX "videos_is_published_idx" ON "sub"."videos"("is_published");
CREATE INDEX "videos_deleted_at_idx" ON "sub"."videos"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "students_public_id_key" ON "sub"."students"("public_id");
CREATE UNIQUE INDEX "students_email_key" ON "sub"."students"("email");
CREATE UNIQUE INDEX "students_token_key" ON "sub"."students"("token");
CREATE INDEX "students_public_id_idx" ON "sub"."students"("public_id");
CREATE INDEX "students_email_idx" ON "sub"."students"("email");
CREATE INDEX "students_token_idx" ON "sub"."students"("token");
CREATE INDEX "students_ats_id_idx" ON "sub"."students"("ats_id");
CREATE INDEX "students_deleted_at_idx" ON "sub"."students"("deleted_at");

-- CreateIndex
CREATE INDEX "watch_events_student_id_idx" ON "sub"."watch_events"("student_id");
CREATE INDEX "watch_events_video_id_idx" ON "sub"."watch_events"("video_id");
CREATE INDEX "watch_events_session_id_idx" ON "sub"."watch_events"("session_id");
CREATE INDEX "watch_events_event_type_idx" ON "sub"."watch_events"("event_type");

-- CreateIndex
CREATE UNIQUE INDEX "student_memos_student_id_author_email_key" ON "sub"."student_memos"("student_id", "author_email");
CREATE INDEX "student_memos_student_id_idx" ON "sub"."student_memos"("student_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_email_idx" ON "sub"."audit_logs"("actor_email");
CREATE INDEX "audit_logs_target_type_idx" ON "sub"."audit_logs"("target_type");

-- AddForeignKey
ALTER TABLE "sub"."watch_events" ADD CONSTRAINT "watch_events_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "sub"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub"."watch_events" ADD CONSTRAINT "watch_events_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "sub"."videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub"."student_memos" ADD CONSTRAINT "student_memos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "sub"."students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateView
CREATE VIEW "sub"."visible_videos" AS
SELECT * FROM "sub"."videos" WHERE "deleted_at" IS NULL;

-- CreateView
CREATE VIEW "sub"."visible_students" AS
SELECT * FROM "sub"."students" WHERE "deleted_at" IS NULL;
