-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "category_name" TEXT NOT NULL,
    "category_description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "event_title" TEXT NOT NULL,
    "event_image" TEXT,
    "event_date" TIMESTAMP(3) NOT NULL,
    "event_time" TIMESTAMP(3) NOT NULL,
    "event_venue" TEXT NOT NULL,
    "event_description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "registration_fee" DOUBLE PRECISION,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_name_key" ON "categories"("category_name");

-- CreateIndex
CREATE INDEX "idx_categories_name" ON "categories"("category_name");

-- CreateIndex
CREATE INDEX "idx_event_user_id" ON "Event"("user_id");

-- CreateIndex
CREATE INDEX "idx_event_date" ON "Event"("event_date");

-- CreateIndex
CREATE INDEX "idx_event_title" ON "Event"("event_title");

-- CreateIndex
CREATE INDEX "idx_event_category_id" ON "Event"("category_id");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
