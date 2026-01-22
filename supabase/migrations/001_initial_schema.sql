-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  charts_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CHARTS TABLE
-- =============================================
CREATE TABLE public.charts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  timezone TEXT NOT NULL,
  utc_offset INTEGER NOT NULL,
  
  -- Calculated data (cached)
  ayanamsa DECIMAL(10, 6),
  ascendant_degree DECIMAL(10, 6),
  ascendant_sign INTEGER,
  moon_sign INTEGER,
  sun_sign INTEGER,
  nakshatra TEXT,
  nakshatra_pada INTEGER,
  
  -- Planetary positions (JSON for flexibility)
  planets JSONB,
  houses JSONB,
  dashas JSONB,
  yogas JSONB,
  
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REPORTS TABLE
-- =============================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chart_id UUID NOT NULL REFERENCES public.charts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  pdf_url TEXT,
  price_paid INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAYMENTS TABLE
-- =============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES public.reports(id),
  razorpay_order_id TEXT NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_charts_user_id ON public.charts(user_id);
CREATE INDEX idx_charts_created_at ON public.charts(created_at DESC);
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_chart_id ON public.reports(chart_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_razorpay_order ON public.payments(razorpay_order_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES - PROFILES
-- =============================================
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- =============================================
-- POLICIES - CHARTS
-- =============================================
CREATE POLICY "Users can view own charts" 
  ON public.charts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own charts" 
  ON public.charts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts" 
  ON public.charts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts" 
  ON public.charts FOR DELETE 
  USING (auth.uid() = user_id);

-- =============================================
-- POLICIES - REPORTS
-- =============================================
CREATE POLICY "Users can view own reports" 
  ON public.reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" 
  ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- POLICIES - PAYMENTS
-- =============================================
CREATE POLICY "Users can view own payments" 
  ON public.payments FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" 
  ON public.payments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check chart limit
CREATE OR REPLACE FUNCTION public.check_chart_limit()
RETURNS TRIGGER AS $$
DECLARE
  chart_count INTEGER;
  user_limit INTEGER;
BEGIN
  SELECT COUNT(*) INTO chart_count 
  FROM public.charts 
  WHERE user_id = NEW.user_id;
  
  SELECT charts_limit INTO user_limit 
  FROM public.profiles 
  WHERE id = NEW.user_id;
  
  IF chart_count >= user_limit THEN
    RAISE EXCEPTION 'Chart limit reached. Maximum % charts allowed.', user_limit;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check chart limit
CREATE TRIGGER check_chart_limit_trigger
  BEFORE INSERT ON public.charts
  FOR EACH ROW EXECUTE FUNCTION public.check_chart_limit();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updated_at on charts
CREATE TRIGGER update_charts_updated_at
  BEFORE UPDATE ON public.charts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger for updated_at on payments
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
