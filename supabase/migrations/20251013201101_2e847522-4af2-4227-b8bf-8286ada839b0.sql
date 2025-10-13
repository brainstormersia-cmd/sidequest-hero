-- Fase 1.1: Aggiungere unique constraint a mission_categories.name
ALTER TABLE mission_categories ADD CONSTRAINT mission_categories_name_key UNIQUE (name);

-- Arricchire categorie missioni
INSERT INTO mission_categories (name, icon, color) VALUES
  ('Lavori Web', '💻', '#3B82F6'),
  ('Design Grafico', '🎨', '#8B5CF6'),
  ('Scrittura/Traduzione', '✍️', '#EC4899'),
  ('Social Media', '📱', '#F59E0B'),
  ('Supporto Emotivo', '💙', '#06B6D4'),
  ('Compagnia Anziani', '👴', '#10B981'),
  ('Baby Sitting', '👶', '#F97316'),
  ('Tutoring', '📖', '#14B8A6'),
  ('Fotografia', '📷', '#A855F7'),
  ('Video Editing', '🎬', '#EF4444')
ON CONFLICT (name) DO NOTHING;

-- Fase 2: Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_mission ON conversations(mission_id);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversations for their missions"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = conversations.mission_id
        AND (m.owner_id = auth.uid() OR m.runner_id = auth.uid())
    )
  );

-- Fase 4: Badge System
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT NOT NULL,
  category TEXT,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges publicly viewable" ON badges FOR SELECT USING (true);
CREATE POLICY "Users view own achievements" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own achievements" ON user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed badges
INSERT INTO badges (name, description, icon, category, requirement_type, requirement_value) VALUES
  ('Rookie', 'Completa la tua prima missione', '🌟', 'missions', 'missions_count', 1),
  ('Hustler', 'Completa 10 missioni', '💪', 'missions', 'missions_count', 10),
  ('Pro', 'Completa 50 missioni', '🏆', 'missions', 'missions_count', 50),
  ('Legend', 'Completa 100 missioni', '👑', 'missions', 'missions_count', 100),
  ('Guadagnatore', 'Guadagna €100', '💰', 'earnings', 'earnings_total', 100),
  ('Milionario', 'Guadagna €1000', '💸', 'earnings', 'earnings_total', 1000),
  ('Stella', 'Mantieni rating 4.8+', '⭐', 'social', 'rating_min', 48),
  ('Velocista', 'Completa 5 missioni in un giorno', '⚡', 'special', 'missions_streak', 5)
ON CONFLICT (name) DO NOTHING;

-- Fase 5: Streets
CREATE TABLE IF NOT EXISTS streets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  street_name TEXT NOT NULL,
  postal_code TEXT,
  province TEXT,
  country TEXT DEFAULT 'Italia',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_streets_city ON streets(city);
CREATE INDEX IF NOT EXISTS idx_streets_name ON streets(street_name);

-- Seed vie
INSERT INTO streets (city, street_name, postal_code, province) VALUES
  ('Roma', 'Via del Corso', '00186', 'RM'),
  ('Roma', 'Via Nazionale', '00184', 'RM'),
  ('Roma', 'Via Veneto', '00187', 'RM'),
  ('Roma', 'Piazza Navona', '00186', 'RM'),
  ('Roma', 'Via Condotti', '00187', 'RM'),
  ('Milano', 'Corso Buenos Aires', '20124', 'MI'),
  ('Milano', 'Via Montenapoleone', '20121', 'MI'),
  ('Milano', 'Corso Vittorio Emanuele', '20122', 'MI'),
  ('Milano', 'Via Dante', '20123', 'MI'),
  ('Napoli', 'Via Toledo', '80134', 'NA'),
  ('Napoli', 'Via Caracciolo', '80122', 'NA'),
  ('Napoli', 'Spaccanapoli', '80138', 'NA'),
  ('Torino', 'Via Roma', '10121', 'TO'),
  ('Torino', 'Via Po', '10124', 'TO'),
  ('Firenze', 'Via de Tornabuoni', '50123', 'FI'),
  ('Firenze', 'Ponte Vecchio', '50125', 'FI'),
  ('Bologna', 'Via Indipendenza', '40121', 'BO'),
  ('Bologna', 'Via Rizzoli', '40125', 'BO'),
  ('Venezia', 'Calle Larga', '30100', 'VE'),
  ('Venezia', 'Riva degli Schiavoni', '30122', 'VE')
ON CONFLICT DO NOTHING;

ALTER TABLE streets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Streets publicly viewable" ON streets FOR SELECT USING (true);