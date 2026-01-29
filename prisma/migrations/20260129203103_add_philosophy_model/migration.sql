-- CreateTable
CREATE TABLE "philosophies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_path" TEXT NOT NULL,
    "extracted_text" TEXT NOT NULL,
    "rules" TEXT[],
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "philosophies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "philosophies" ADD CONSTRAINT "philosophies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
