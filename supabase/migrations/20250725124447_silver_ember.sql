/*
  # Menambahkan kolom webhook_url ke tabel chats

  1. Perubahan Tabel
    - Menambahkan kolom `webhook_url` ke tabel `chats`
    - Kolom ini akan menyimpan URL webhook n8n yang spesifik untuk setiap chat
    - Kolom bersifat opsional (nullable) untuk backward compatibility

  2. Keamanan
    - Tidak ada perubahan pada RLS policies
    - User tetap hanya bisa mengakses chat mereka sendiri
*/

-- Add webhook_url column to chats table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chats' AND column_name = 'webhook_url'
  ) THEN
    ALTER TABLE chats ADD COLUMN webhook_url text;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN chats.webhook_url IS 'URL webhook n8n yang spesifik untuk chat ini';