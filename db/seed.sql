-- Starter packages. Edit prices/copy in /admin/packages after deploy.
insert into packages (slug, name, description, price_cents, includes, turnaround, is_featured, sort_order)
values
  (
    'essential',
    'Essential',
    'A focused 30-minute session for one polished, professional headshot.',
    29500,
    array['30-minute session', '1 look, 1 background', '2 retouched images', 'Online proof gallery', 'Web + print resolution files'],
    '3 business days',
    false,
    1
  ),
  (
    'professional',
    'Professional',
    'The most popular choice: more time, more looks, more images to choose from.',
    49500,
    array['60-minute session', '2 looks, 2 backgrounds', '5 retouched images', 'Online proof gallery with comments', 'LinkedIn crop included', 'Web + print resolution files'],
    '3 business days',
    true,
    2
  ),
  (
    'executive',
    'Executive',
    'An unhurried session with full creative direction and a complete image library.',
    89500,
    array['90-minute session', 'Unlimited looks', '10 retouched images', 'On-location option', 'Online proof gallery with comments', 'Priority 48-hour turnaround'],
    '2 business days',
    false,
    3
  ),
  (
    'team',
    'Team & Office',
    'Consistent headshots for your whole team, on-site at your office.',
    15000,
    array['Per person, 5-person minimum', 'On-site at your office', '1 retouched image per person', 'Consistent lighting and background', 'Shared team gallery'],
    '5 business days',
    false,
    4
  )
on conflict (slug) do nothing;
