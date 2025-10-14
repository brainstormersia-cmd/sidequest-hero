-- Tabella per tracciare tutti gli acquisti di boost
CREATE TABLE public.purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  stripe_payment_intent_id text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabella per tracciare i boost attivi degli utenti
CREATE TABLE public.active_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id text NOT NULL,
  purchase_id uuid REFERENCES public.purchases(id) ON DELETE CASCADE NOT NULL,
  activated_at timestamp with time zone NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Tabella per idempotenza webhook Stripe
CREATE TABLE public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Indici per performance
CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_stripe_payment_intent ON public.purchases(stripe_payment_intent_id);
CREATE INDEX idx_active_boosts_user_id ON public.active_boosts(user_id);
CREATE INDEX idx_active_boosts_expires_at ON public.active_boosts(expires_at);
CREATE INDEX idx_webhook_events_stripe_event_id ON public.webhook_events(stripe_event_id);

-- Enable RLS
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies per purchases
CREATE POLICY "Users can view their own purchases"
  ON public.purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON public.purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies per active_boosts
CREATE POLICY "Users can view their own active boosts"
  ON public.active_boosts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active boosts"
  ON public.active_boosts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies per webhook_events (solo per edge functions con service role)
CREATE POLICY "Service role can manage webhook events"
  ON public.webhook_events
  FOR ALL
  USING (false);

-- Trigger per aggiornamento automatico updated_at
CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_active_boosts_updated_at
  BEFORE UPDATE ON public.active_boosts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();