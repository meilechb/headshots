-- Packages. Edit in /admin/packages after deploy.
insert into packages (slug, name, description, price_cents, includes, turnaround, is_featured, sort_order)
values
  ('individual', 'Individual headshot', 'At the studio in Spring Valley.', 25000, array['One person', 'Retouched photos delivered online'], null, false, 1),
  ('custom', 'Custom package', 'We come to you. Two or more people.', 0, array['On-site at your office', 'Priced per group'], null, false, 2)
on conflict (slug) do nothing;
