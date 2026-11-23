-- Seed Data for Premier Property Management & Development
-- All 6 sample properties are clearly marked with is_sample = true and [Sample Listing]

insert into public.site_settings (
  id, business_name, address, phone_display, phone_international, whatsapp_url,
  email, working_hours, google_rating, google_review_count, google_maps_url,
  hero_headline, hero_subheadline
) values (
  'main',
  'Premier Property Management & Development',
  '103, Park Avenue Colony, Pak Avenue Housing Scheme, Sahiwal, Pakistan',
  '0300 0061397',
  '+92 300 0061397',
  'https://wa.me/923000061397',
  'contact@premierproperty.pk',
  'Monday – Saturday, 9:30 AM – 6:30 PM',
  4.8,
  19,
  'https://maps.app.goo.gl/9hdioY3UeVDvuwxN6',
  'Measured real estate stewardship in Sahiwal.',
  'Residential homes, vetted plots, and commercial assets across Pak Avenue Housing Scheme and Sahiwal — handled with direct documentation and plain dealing.'
) on conflict (id) do nothing;

insert into public.properties (
  slug, title, description, purpose, type, price_pkr, area_size, area_unit,
  bedrooms, bathrooms, parking, furnished, year_built, address_area,
  latitude, longitude, amenities, status, featured, published, is_sample,
  cover_image_url, cover_image_alt
) values
(
  'sample-1-kanal-modern-villa-pak-avenue',
  '[Sample Listing] 1 Kanal Contemporary Residence in Pak Avenue',
  'Placeholder sample property for layout demonstration. Designed around a shaded travertine courtyard, this 1 Kanal residence features double-height reception rooms, solid ash woodwork, a dedicated study, and dual kitchens.',
  'sale', 'house', 68500000, 1, 'kanal',
  5, 6, 3, false, 2025, 'Block A, Pak Avenue Housing Scheme, Sahiwal',
  30.6682, 73.1114,
  array['Travertine flooring', 'Solar hybrid wiring', 'Double-glazed windows', 'Servant quarter', 'Lawn & courtyard'],
  'for_sale', true, true, true,
  '/src/assets/images/prop_pak_avenue_villa_1795434553272.jpg',
  'Contemporary 1 Kanal travertine and plaster residence in Pak Avenue Housing Scheme'
),
(
  'sample-10-marla-corner-house-park-avenue',
  '[Sample Listing] 10 Marla Corner House near Park Avenue Colony',
  'Placeholder sample property for layout demonstration. North-east corner orientation with vertical timber sun louvers, cross-ventilated bedrooms, and a walled side garden.',
  'sale', 'house', 34500000, 10, 'marla',
  4, 5, 2, false, 2024, 'Park Avenue Colony, Pak Avenue Housing Scheme, Sahiwal',
  30.6695, 73.1132,
  array['Corner plot', 'Cedar sun louvers', 'Underground water tank', 'CCTV conduit', 'Terrace lounge'],
  'for_sale', true, true, true,
  '/src/assets/images/prop_park_avenue_corner_1795434555591.jpg',
  'Modern 10 Marla corner house with vertical timber louvers'
),
(
  'sample-1-kanal-boulevard-residential-plot',
  '[Sample Listing] 1 Kanal Main Boulevard Residential Plot',
  'Placeholder sample property for layout demonstration. Levelled, possession-ready residential plot fronting an 80-foot wide landscaped boulevard with underground electricity and clear society transfer.',
  'sale', 'plot', 22500000, 1, 'kanal',
  0, 0, 0, false, null, 'Main Boulevard, Pak Avenue Housing Scheme, Sahiwal',
  30.6710, 73.1150,
  array['Possession ready', '80 ft carpeted road', 'Underground utilities', '24/7 gated security', 'Park facing'],
  'for_sale', true, true, true,
  '/src/assets/images/prop_canal_view_plot_1795434554518.jpg',
  'Wide landscaped residential boulevard with mature trees and underground utilities'
),
(
  'sample-commercial-building-gt-road-sahiwal',
  '[Sample Listing] 4-Storey Commercial Office & Retail Building',
  'Placeholder sample property for layout demonstration. Purpose-built commercial asset with ground-floor retail showroom frontage, three upper corporate floors, dedicated elevator shaft, and basement parking.',
  'sale', 'commercial_building', 145000000, 16, 'marla',
  0, 6, 8, false, 2025, 'Commercial Zone, Sahiwal',
  30.6641, 73.1065,
  array['Passenger lift shaft', 'Dedicated transformer space', 'Basement parking', 'Fire safety risers', 'Low-iron glass facade'],
  'for_sale', true, true, true,
  '/src/assets/images/prop_commercial_plaza_1795434553888.jpg',
  'Four-storey commercial office and retail building with muted brass fins'
),
(
  'sample-furnished-5-marla-executive-residence-rent',
  '[Sample Listing] Furnished Executive Residence for Rent',
  'Placeholder sample property for layout demonstration. Quiet, move-in-ready furnished residence ideal for corporate executives or visiting specialists in Sahiwal.',
  'rent', 'house', 145000, 5, 'marla',
  3, 3, 1, true, 2023, 'Pak Avenue Housing Scheme, Sahiwal',
  30.6678, 73.1101,
  array['Fully furnished', 'Inverter AC units', 'Courtyard garden', 'High-speed fiber ready', 'Backup UPS'],
  'for_rent', true, true, true,
  '/src/assets/images/prop_modern_interior_1795434553777.jpg',
  'Minimalist furnished living room overlooking a green courtyard garden'
),
(
  'sample-luxury-3-bed-apartment-suite-rent',
  '[Sample Listing] 3-Bedroom Courtyard Apartment Suite',
  'Placeholder sample property for layout demonstration. Low-rise corner apartment featuring shaded recessed balconies, walnut kitchen cabinetry, and covered parking.',
  'rent', 'apartment', 85000, 1850, 'sq_ft',
  3, 3, 1, false, 2024, 'Park Avenue Extension, Sahiwal',
  30.6702, 73.1095,
  array['Recessed balcony', 'Covered car park', 'Gated entry', 'Backup generator', 'Elevator access'],
  'for_rent', true, true, true,
  '/src/assets/images/prop_apartment_residence_1795434553940.jpg',
  'Low-rise limestone apartment building with recessed dark pine green balconies'
) on conflict (slug) do nothing;
