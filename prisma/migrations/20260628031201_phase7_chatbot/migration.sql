-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN     "chatbot_knowledge_en" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "chatbot_knowledge_zh" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "show_chatbot" BOOLEAN NOT NULL DEFAULT false;
