-- Seed dataset for local development / previews
-- Safe to run multiple times thanks to upserts.

insert into public.mission_categories (id, name, icon, color)
values
  ('11111111-1111-1111-1111-111111111111','Consegne','📦','#FFD60A'),
  ('22222222-2222-2222-2222-222222222222','Pet Care','🐕','#2ECC71'),
  ('33333333-3333-3333-3333-333333333333','Pulizie','🧽','#4ECDC4'),
  ('44444444-4444-4444-4444-444444444444','Traslochi','🚚','#003566')
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  color = excluded.color;

insert into public.profiles (id, user_id, first_name, last_name, location, rating_average, rating_count, missions_completed, missions_created, total_earnings, is_verified)
values
  ('55555555-5555-5555-5555-555555555555','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Giulia','Rossi','Milano',4.9,28,42,5,4280,true),
  ('66666666-6666-6666-6666-666666666666','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Luca','Ferri','Bologna',4.8,19,31,7,3260,false)
on conflict (user_id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  location = excluded.location,
  rating_average = excluded.rating_average,
  rating_count = excluded.rating_count,
  missions_completed = excluded.missions_completed,
  missions_created = excluded.missions_created,
  total_earnings = excluded.total_earnings,
  is_verified = excluded.is_verified,
  updated_at = now();

insert into public.missions (id, title, description, price, location, duration_hours, status, category_id, owner_id)
values
  ('77777777-7777-7777-7777-777777777777','Passeggiata cani weekend','Accudisci due golden retriever per il weekend con tre passeggiate al giorno.',65,'Milano',6,'open','22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  ('88888888-8888-8888-8888-888888888888','Consegna pacchi centro','Ritiro presso Via Torino e consegna di 5 pacchi nel centro storico.',45,'Milano',3,'in_progress','11111111-1111-1111-1111-111111111111','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  price = excluded.price,
  location = excluded.location,
  duration_hours = excluded.duration_hours,
  status = excluded.status,
  category_id = excluded.category_id,
  owner_id = excluded.owner_id,
  updated_at = now();

insert into public.notifications (id, user_id, title, message, type, is_read)
values
  ('99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Pagamento ricevuto','Hai ricevuto €45 per la missione "Consegna pacchi centro".','payment',false),
  ('aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Nuovo messaggio','Giulia ti ha scritto per organizzare la missione di dog sitting.','message',false)
on conflict (id) do update set
  title = excluded.title,
  message = excluded.message,
  type = excluded.type,
  is_read = excluded.is_read;

insert into public.transactions (id, user_id, mission_id, amount, type, status, description)
values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','88888888-8888-8888-8888-888888888888',45,'earning','completed','Pagamento missione consegna centro'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','77777777-7777-7777-7777-777777777777',65,'payment','escrow','Importo bloccato in escrow per dog sitting')
on conflict (id) do update set
  amount = excluded.amount,
  type = excluded.type,
  status = excluded.status,
  description = excluded.description;
