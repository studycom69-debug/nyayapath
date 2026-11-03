-- ============================================================
-- NyayaPath / Legal AI App - Supabase Database Setup & Schema
-- Run this in the Supabase SQL Editor for your project.
-- ============================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'lawyer', 'admin')),
  organization TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  specialization TEXT,
  experience NUMERIC DEFAULT 0,
  education TEXT,
  bar_registration TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read of verified lawyer profiles for the directory, and allow users to read their own profile (recursion-free)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visibility policy" ON public.profiles;
CREATE POLICY "Profiles visibility policy"
  ON public.profiles FOR SELECT
  USING (
    role = 'lawyer' OR
    auth.uid() = id
  );

-- Allow authenticated users to insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 3. Automatic Profile Creation Trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, organization)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE(NEW.raw_user_meta_data->>'organization', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    organization = EXCLUDED.organization;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  contact_method TEXT DEFAULT 'Email',
  urgency TEXT DEFAULT 'Standard',
  file_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow users to see their own questions, and lawyers/admins to see all questions
DROP POLICY IF EXISTS "Users and lawyers can read questions" ON public.questions;
CREATE POLICY "Users and lawyers can read questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('lawyer', 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can insert questions" ON public.questions;
CREATE POLICY "Users can insert questions"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lawyers and authors can update questions" ON public.questions;
CREATE POLICY "Lawyers and authors can update questions"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('lawyer', 'admin')
    )
  );

-- 5. Cases Table (Indian Case Laws)
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  court TEXT,
  year TEXT,
  summary TEXT,
  full_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public cases are viewable by everyone" ON public.cases;
CREATE POLICY "Public cases are viewable by everyone"
  ON public.cases FOR SELECT
  USING (true);

-- 6. Messages Table (Lawyer - Client Chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Chat participants can view messages" ON public.messages;
CREATE POLICY "Chat participants can view messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their messages" ON public.messages;
CREATE POLICY "Users can insert their messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- 7. Chat Messages Table (AI Legal Assistant)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own ai chats" ON public.chat_messages;
CREATE POLICY "Users view own ai chats"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users insert own ai chats" ON public.chat_messages;
CREATE POLICY "Users insert own ai chats"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 8. Chat Status Table
CREATE TABLE IF NOT EXISTS public.chat_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_closed BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.chat_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants view chat status" ON public.chat_status;
CREATE POLICY "Participants view chat status"
  ON public.chat_status FOR SELECT
  TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid());

DROP POLICY IF EXISTS "Participants insert chat status" ON public.chat_status;
CREATE POLICY "Participants insert chat status"
  ON public.chat_status FOR INSERT
  TO authenticated
  WITH CHECK (user_a = auth.uid() OR user_b = auth.uid());

DROP POLICY IF EXISTS "Participants update chat status" ON public.chat_status;
CREATE POLICY "Participants update chat status"
  ON public.chat_status FOR UPDATE
  TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid());

-- 9. Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_time TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure foreign key name matches code: bookings_user_id_fkey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bookings_user_id_fkey'
  ) THEN
    ALTER TABLE public.bookings
      ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id);
  END IF;
END $$;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients and lawyers view bookings" ON public.bookings;
CREATE POLICY "Clients and lawyers view bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR lawyer_id = auth.uid());

DROP POLICY IF EXISTS "Clients insert bookings" ON public.bookings;
CREATE POLICY "Clients insert bookings"
  ON public.bookings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Clients and lawyers update bookings" ON public.bookings;
CREATE POLICY "Clients and lawyers update bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR lawyer_id = auth.uid());

-- 10. Lawyer Reviews Table
CREATE TABLE IF NOT EXISTS public.lawyer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lawyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lawyer_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view reviews" ON public.lawyer_reviews;
CREATE POLICY "Public can view reviews"
  ON public.lawyer_reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert reviews" ON public.lawyer_reviews;
CREATE POLICY "Users can insert reviews"
  ON public.lawyer_reviews FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own reviews" ON public.lawyer_reviews;
CREATE POLICY "Users can update own reviews"
  ON public.lawyer_reviews FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- 11. Storage Buckets (run in Supabase storage or SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-files', 'chat-files', true),
       ('question-documents', 'question-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 12. Seed Landmark Cases
INSERT INTO public.cases (title, court, year, summary, full_text)
VALUES
  (
    'Kesavananda Bharati v. State of Kerala',
    'Supreme Court of India',
    '1973',
    'Landmark ruling establishing the "Basic Structure Doctrine", restricting Parliament from altering the fundamental structure of the Constitution under Article 368.',
    'A 13-judge constitutional bench ruled by a 7-6 majority that while Parliament has wide powers under Article 368 to amend any part of the Constitution, including Fundamental Rights, it cannot amend the Basic Structure or foundational pillars of the Constitution.'
  ),
  (
    'Maneka Gandhi v. Union of India',
    'Supreme Court of India',
    '1978',
    'Radically expanded Article 21 (Right to Life and Personal Liberty), ruling that any law depriving personal liberty must be just, fair, and reasonable.',
    'When Maneka Gandhis passport was impounded without reason, the Supreme Court held that the right to travel abroad is part of personal liberty under Article 21 and introduced substantive due process into Indian jurisprudence.'
  ),
  (
    'Justice K.S. Puttaswamy (Retd.) v. Union of India',
    'Supreme Court of India',
    '2017',
    'Unanimous 9-judge bench decision affirming that the Right to Privacy is a fundamental right protected under Article 21 and Part III of the Constitution.',
    'The Supreme Court unanimously ruled that privacy is an intrinsic part of the right to life and personal liberty under Article 21, establishing a strict three-fold proportionality test.'
  ),
  (
    'Vishaka and Ors. v. State of Rajasthan',
    'Supreme Court of India',
    '1997',
    'Formulated the historic "Vishaka Guidelines" for the prevention and redressal of sexual harassment of women in the workplace.',
    'The Supreme Court filled a legislative vacuum by framing binding guidelines requiring workplaces to establish Internal Complaints Committees, later codified in the POSH Act, 2013.'
  ),
  (
    'Navtej Singh Johar v. Union of India',
    'Supreme Court of India',
    '2018',
    'Unanimously decriminalized consensual homosexual acts between adults by reading down Section 377 IPC.',
    'A 5-judge Constitution bench held that Section 377 IPC violated Articles 14, 15, 19, and 21 to the extent that it criminalized consensual sexual acts between adults in private.'
  ),
  (
    'Shreya Singhal v. Union of India',
    'Supreme Court of India',
    '2015',
    'Struck down Section 66A of the Information Technology Act, 2000 as unconstitutional for violating the freedom of speech and expression.',
    'The Supreme Court struck down Section 66A in its entirety on grounds of overbreadth and vagueness under Article 19(1)(a).'
  )
ON CONFLICT DO NOTHING;

