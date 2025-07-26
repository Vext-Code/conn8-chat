ALTER TABLE public.messages
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT;

ALTER TABLE public.messages
ALTER COLUMN content DROP NOT NULL;
