-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,

  constraint full_name_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Categories table
create table categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  slug text not null,
  icon text,
  color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table categories enable row level security;

create policy "Users can view own categories." on categories
  for select using (auth.uid() = user_id);

create policy "Users can insert own categories." on categories
  for insert with check (auth.uid() = user_id);

create policy "Users can update own categories." on categories
  for update using (auth.uid() = user_id);

create policy "Users can delete own categories." on categories
  for delete using (auth.uid() = user_id);

-- Entries table
create table entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references categories,
  content text not null,
  entry_type text check (entry_type in ('task', 'note', 'insight', 'bookmark')),
  status text default 'pending' check (status in ('pending', 'done', 'archived')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table entries enable row level security;

create policy "Users can view own entries." on entries
  for select using (auth.uid() = user_id);

create policy "Users can insert own entries." on entries
  for insert with check (auth.uid() = user_id);

create policy "Users can update own entries." on entries
  for update using (auth.uid() = user_id);

create policy "Users can delete own entries." on entries
  for delete using (auth.uid() = user_id);

-- trigger to create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- Insert default categories
  insert into public.categories (user_id, name, slug, icon, color)
  values 
    (new.id, 'Doméstico', 'home', 'Home', 'bg-emerald-500'),
    (new.id, 'Trabalho', 'work', 'Briefcase', 'bg-blue-500'),
    (new.id, 'Faculdade', 'uni', 'GraduationCap', 'bg-purple-500'),
    (new.id, 'Ideias', 'ideas', 'Lightbulb', 'bg-amber-500');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
