-- Packages. Edit in /admin/packages after deploy.
insert into packages (slug, name, description, price_cents, includes, turnaround, is_featured, sort_order)
values
  ('individual', 'Individual headshot', 'At the studio.', 25000, '{}', null, false, 1),
  ('custom', 'Custom package', 'We come to you.', 0, '{}', null, false, 2)
on conflict (slug) do nothing;
