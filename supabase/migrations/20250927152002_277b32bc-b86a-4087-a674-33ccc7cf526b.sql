-- Create core tables for SideQuest community platform

-- User profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  date_of_birth DATE,
  location TEXT,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  missions_completed INTEGER DEFAULT 0,
  missions_created INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Mission categories table
CREATE TABLE public.mission_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#FFD60A',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Missions table
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES mission_categories(id),
  owner_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  runner_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
  price DECIMAL(10,2) NOT NULL,
  location TEXT NOT NULL,
  duration_hours INTEGER,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_completion', 'completed', 'cancelled')),
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Reviews and ratings table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'mission_update', 'payment', 'message', 'review')),
  is_read BOOLEAN DEFAULT false,
  related_mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Wallet transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT CHECK (type IN ('earning', 'payment', 'refund', 'fee')) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Profiles are publicly viewable" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for missions
CREATE POLICY "Missions are publicly viewable" ON public.missions
  FOR SELECT USING (true);

CREATE POLICY "Users can create missions" ON public.missions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own missions or accepted missions" ON public.missions
  FOR UPDATE USING (auth.uid() = owner_id OR auth.uid() = runner_id);

-- Create RLS policies for other tables
CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT USING (auth.uid() = reviewer_id OR auth.uid() = reviewed_user_id);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can view messages for their missions" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m 
      WHERE m.id = mission_id 
      AND (m.owner_id = auth.uid() OR m.runner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for their missions" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM missions m 
      WHERE m.id = mission_id 
      AND (m.owner_id = auth.uid() OR m.runner_id = auth.uid())
    )
  );

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default mission categories
INSERT INTO public.mission_categories (name, icon, color) VALUES
  ('Consegne', '🚛', '#FFD60A'),
  ('Pulizie', '🧽', '#2ECC71'),
  ('Pet Care', '🐕', '#E63946'),
  ('Traslochi', '📦', '#003566'),
  ('Spesa', '🛒', '#F59E0B'),
  ('Giardinaggio', '🌱', '#2ECC71'),
  ('Riparazioni', '🔧', '#6B7280'),
  ('Aiuto Studio', '📚', '#8B5CF6'),
  ('Altro', '⭐', '#FFD60A');