-- ============================================================================
--  LoviDovi · struttura del database
--  Da incollare in Supabase → SQL Editor → New query → Run.
--  Si può rieseguire senza danni: tutto è "create if not exists".
-- ============================================================================

-- ---------------------------------------------------------------- tabelle --

create table if not exists public.categories (
  id      text primary key,
  name    text not null,
  emoji   text not null default '📦',
  color   text not null default 'custom',
  kind    text not null default 'generic',
  builtin boolean not null default false,
  sort    integer not null default 0
);

create table if not exists public.items (
  id             text primary key,
  category_id    text not null references public.categories(id) on delete cascade,
  title          text not null default '',
  subtitle       text not null default '',
  status         text not null default 'wish',
  start_date     date,
  end_date       date,
  notes          text not null default '',
  rating_a       smallint,
  rating_b       smallint,
  meta           jsonb not null default '{}'::jsonb,
  cover_photo_id text,
  lat            double precision,
  lng            double precision,
  visits         integer not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists items_category_idx on public.items(category_id);
create index if not exists items_start_date_idx on public.items(start_date);

-- Le tappe di un viaggio.
create table if not exists public.stops (
  id       text primary key,
  item_id  text not null references public.items(id) on delete cascade,
  name     text not null default '',
  days     smallint not null default 1,
  notes    text not null default '',
  position smallint not null default 0,
  lat      double precision,
  lng      double precision
);
create index if not exists stops_item_idx on public.stops(item_id);

-- Il giorno per giorno di ogni tappa.
create table if not exists public.stop_days (
  id       text primary key,
  stop_id  text not null references public.stops(id) on delete cascade,
  position smallint not null default 0,
  title    text not null default '',
  notes    text not null default ''
);
create index if not exists stop_days_stop_idx on public.stop_days(stop_id);

-- Le foto: qui c'è solo il riferimento, il file vive nello Storage.
create table if not exists public.photos (
  id         text primary key,
  scope      text not null,
  ref_id     text not null,
  path       text not null,
  caption    text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists photos_ref_idx on public.photos(scope, ref_id);

-- Gli impegni scritti a mano sul calendario.
create table if not exists public.events (
  id         text primary key,
  title      text not null default '',
  date       date not null,
  end_date   date,
  time       text,
  notes      text not null default '',
  color      text not null default 'agenda',
  author     text,
  exam_outcome   text,
  exam_ask_after date,
  created_at timestamptz not null default now()
);
create index if not exists events_date_idx on public.events(date);

create table if not exists public.achievements (
  id          text primary key,
  key         text not null default 'manual',
  title       text not null default '',
  description text not null default '',
  emoji       text not null default '🏆',
  kind        text not null default 'manual',
  target      smallint not null default 1,
  unlocked_at timestamptz,
  custom      boolean not null default false
);

-- I traguardi che si ripetono: una riga per scala, con il livello raggiunto.
create table if not exists public.ladders (
  id          text primary key,
  level       smallint not null default 0,
  unlocked_at timestamptz
);

-- I nostri modi di dire.
create table if not exists public.sayings (
  id         text primary key,
  text       text not null default '',
  author     text not null default 'both',
  meaning    text not null default '',
  created_at timestamptz not null default now()
);

-- Le frasi che compaiono nei pop-up.
create table if not exists public.quotes (
  id         text primary key,
  text       text not null default '',
  song       text not null default '',
  era        text not null default '',
  created_at timestamptz not null default now()
);

-- Una riga sola, sempre con id = 1.
create table if not exists public.settings (
  id               smallint primary key default 1,
  name_a           text not null default 'Lui',
  name_b           text not null default 'Lei',
  anniversary      date,
  saying_frequency smallint not null default 20,
  reduced_motion   boolean not null default false,
  app_name         text not null default 'LoviDovi',
  texts            jsonb not null default '{}'::jsonb,
  constraint settings_single_row check (id = 1)
);

-- ------------------------------------------------------- aggiornamenti --
-- Queste righe servono a chi ha già creato il database con una versione
-- precedente: aggiungono le colonne nuove senza toccare i dati esistenti.
-- Su un database appena creato non fanno nulla, ed è giusto così.

alter table public.items    add column if not exists lat double precision;
alter table public.items    add column if not exists lng double precision;
alter table public.stops    add column if not exists lat double precision;
alter table public.stops    add column if not exists lng double precision;
alter table public.settings add column if not exists app_name text not null default 'LoviDovi';
alter table public.settings add column if not exists texts jsonb not null default '{}'::jsonb;
alter table public.items    add column if not exists visits integer not null default 0;
alter table public.events   add column if not exists author text;
alter table public.events   add column if not exists exam_outcome text;
alter table public.events   add column if not exists exam_ask_after date;

-- I traguardi numerati (1, 5, 10 viaggi...) sono diventati "scale" a livelli,
-- che crescono da sole: le vecchie schede non servono più. Tocchiamo solo
-- quelle di partenza, mai quelle inventate da noi (custom = true).
delete from public.achievements
where custom = false
  and id in (
    'ach-anniv-1','ach-anniv-2','ach-anniv-3','ach-anniv-4','ach-anniv-5',
    'ach-anniv-6','ach-anniv-7','ach-anniv-8','ach-anniv-9','ach-anniv-10',
    'ach-trip-1','ach-trip-5','ach-trip-10','ach-stops-20',
    'ach-place-1','ach-place-10','ach-place-25',
    'ach-out-5','ach-out-15','ach-screen-10',
    'ach-m-plant'
  );

-- E i nuovi entrano, senza toccare quelli già sbloccati.
insert into public.achievements (id, key, title, description, emoji, kind, target, custom) values
  ('ach-sushi','sushi','Primo sushi','Il primo giapponese da quando esiste questa app.','🍣','auto',1,false),
  ('ach-m-finalmente','manual','Finalmente','Alessia ha cagato con la porta chiusa.','🚪','manual',1,false),
  ('ach-m-bisu','manual','Bisu','Alessia ha dato 10 baci ad Albi.','😘','manual',1,false),
  ('ach-m-chonky','manual','Chonky Chonky','Albi ha toccato la panciotta almeno 10 volte.','🐻','manual',1,false)
on conflict (id) do nothing;

-- --------------------------------------------------------------- sicurezza --
-- Row Level Security: senza login non si legge e non si scrive niente.
-- Siete due su un account solo, quindi chi è autenticato può fare tutto.

do $$
declare t text;
begin
  foreach t in array array[
    'categories','items','stops','stop_days','photos',
    'events','achievements','ladders','sayings','quotes','settings'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "coppia_tutto" on public.%I', t);
    execute format(
      'create policy "coppia_tutto" on public.%I for all to authenticated using (true) with check (true)', t
    );
  end loop;
end $$;

-- --------------------------------------------------------------- realtime --
-- Serve perché le modifiche di uno compaiano sul telefono dell'altra.

do $$
declare t text;
begin
  foreach t in array array[
    'categories','items','stops','stop_days','photos',
    'events','achievements','ladders','sayings','quotes','settings'
  ]
  loop
    begin
      execute format('alter publication supabase_realtime add table public.%I', t);
    exception
      when duplicate_object then null; -- già presente, va bene così
    end;
  end loop;
end $$;

-- ---------------------------------------------------------------- storage --
-- Bucket PRIVATO: le foto si vedono solo con un indirizzo firmato,
-- che l'app genera a ogni avvio dopo il login.

insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do update set public = false;

drop policy if exists "coppia_foto_lettura"    on storage.objects;
drop policy if exists "coppia_foto_scrittura"  on storage.objects;
drop policy if exists "coppia_foto_modifica"   on storage.objects;
drop policy if exists "coppia_foto_rimozione"  on storage.objects;

create policy "coppia_foto_lettura" on storage.objects
  for select to authenticated using (bucket_id = 'photos');

create policy "coppia_foto_scrittura" on storage.objects
  for insert to authenticated with check (bucket_id = 'photos');

create policy "coppia_foto_modifica" on storage.objects
  for update to authenticated using (bucket_id = 'photos') with check (bucket_id = 'photos');

create policy "coppia_foto_rimozione" on storage.objects
  for delete to authenticated using (bucket_id = 'photos');

-- Fatto. Torniamo sull'app e facciamo login con la password del nostro account. 💗
