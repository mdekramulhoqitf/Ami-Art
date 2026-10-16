-- Ami Art — starter content (Bangla-first)
-- Honest, letterhead-grounded copy, written directly in Bengali. No invented statistics or
-- stock photos — hero_slides and portfolio_items are intentionally left empty so the site's
-- fallback/empty states render until the owner uploads real photos via /admin. Service images
-- are also left empty (icon fallback shows instead) until the owner uploads real product photos.

insert into site_settings (
  id, business_name, tagline, intro_heading, intro_body,
  trust_badges, home_highlights, capability_highlights, delivery_settings,
  meta_title, meta_description
) values (
  1,
  'Ami Art',
  'বরগুনায় ডিজিটাল সাইন, প্রিন্টিং ও ক্রিয়েটিভ ডিজাইন',
  'বরগুনায় সাইন, প্রিন্ট ও ডিজাইনের বিশ্বস্ত ঠিকানা',
  'আমি আর্ট বরগুনা ভিত্তিক একটি ডিজিটাল সাইন, প্রিন্টিং ও ডিজাইন প্রতিষ্ঠান। আমরা PVC ও ফোম বোর্ড, ব্যানার, ফ্লেক্স প্রিন্ট এবং কাস্টম গ্রাফিক ডিজাইনের কাজ করি — যত্ন সহকারে, চাহিদা অনুযায়ী।',
  '[
    {"title": "বরগুনা ভিত্তিক", "description": "নজরুল ইসলাম রোডে স্থানীয়ভাবে পরিচালিত।"},
    {"title": "নিজস্ব প্রিন্টিং সুবিধা", "description": "ডিজাইন থেকে প্রিন্টিং পর্যন্ত কাজ এক জায়গা থেকে সম্পন্ন করার সুবিধা।"},
    {"title": "চাহিদা অনুযায়ী কাজ", "description": "প্রতিটি কাজ আপনার প্রয়োজন অনুযায়ী তৈরি করা হয়।"}
  ]'::jsonb,
  '[
    {"title": "মানসম্মত কাজ", "description": "ফাইল থেকে চূড়ান্ত পণ্য পর্যন্ত যত্নসহকারে তৈরি।"},
    {"title": "সৃজনশীল চিন্তা", "description": "সাধারণ টেমপ্লেট নয়, আপনার ব্র্যান্ডের উপযোগী ডিজাইন।"},
    {"title": "নির্ভরযোগ্য সময়", "description": "কাজ শুরুর আগেই স্পষ্ট সময়সীমা জানানো হয়।"},
    {"title": "গ্রাহক অগ্রাধিকার", "description": "পুরো কাজ জুড়ে সরাসরি যোগাযোগ।"}
  ]'::jsonb,
  '[
    {"title": "ডিজাইন", "description": "গ্রাফিক ও ব্র্যান্ডিং সেবা।"},
    {"title": "প্রিন্টিং", "description": "বিভিন্ন ধরনের প্রিন্টিং সেবা।"},
    {"title": "কাস্টম প্রিন্ট", "description": "মগ, টি-শার্ট, জার্সি ও অন্যান্য কাস্টম প্রিন্ট।"},
    {"title": "ওয়েবসাইট", "description": "ব্যবসাকে অনলাইনে আনার জন্য ১ পেজ ল্যান্ডিং পেজ।"},
    {"title": "হোম ডেলিভারি", "description": "প্রয়োজনে কুরিয়ারের মাধ্যমে পণ্য গ্রহণের সুবিধা।"}
  ]'::jsonb,
  '{"courier_fee": 0, "local_delivery_fee": 0, "free_delivery_threshold": null, "enabled": true}'::jsonb,
  'আমি আর্ট — বরগুনায় ডিজিটাল সাইন, প্রিন্টিং ও ডিজাইন',
  'বরগুনার আমি আর্ট থেকে ডিজিটাল সাইনবোর্ড, ব্যানার-ফ্লেক্স প্রিন্ট, লোগো ও গ্রাফিক ডিজাইন সেবা।'
)
on conflict (id) do update set
  business_name = excluded.business_name,
  tagline = excluded.tagline,
  intro_heading = excluded.intro_heading,
  intro_body = excluded.intro_body,
  trust_badges = excluded.trust_badges,
  home_highlights = excluded.home_highlights,
  capability_highlights = excluded.capability_highlights,
  meta_title = excluded.meta_title,
  meta_description = excluded.meta_description;

insert into contact_settings (id, phone, email, address, map_embed_url, social_links)
values (
  1,
  '01728-874204',
  'amiart54@gmail.com',
  'নজরুল ইসলাম রোড, বরগুনা',
  'https://www.google.com/maps?q=Nazrul%20Islam%20Road%2C%20Barguna%2C%20Bangladesh&output=embed',
  '[]'::jsonb
)
on conflict (id) do update set
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  map_embed_url = excluded.map_embed_url;

insert into about_content (
  id, heading, story, mission, vision, why_choose_us, process_steps
) values (
  1,
  'আমি আর্ট সম্পর্কে',
  'আমি আর্ট বরগুনার নজরুল ইসলাম রোডে অবস্থিত একটি ডিজিটাল সাইন, প্রিন্টিং ও গ্রাফিক ডিজাইন প্রতিষ্ঠান। আমরা স্থানীয় দোকান, অফিস ও প্রতিষ্ঠানের জন্য সাইনবোর্ড, ব্যানার থেকে শুরু করে ভিজিটিং কার্ড ও প্রচারমূলক প্রিন্ট পর্যন্ত সব ধরনের কাজ করি — ডিজাইন ও প্রোডাকশন একসাথে সামলাই, যাতে চূড়ান্ত কাজ ঠিক আপনার চাহিদা অনুযায়ী হয়।',
  'বরগুনার ব্যবসাগুলোকে পেশাদার মানের সাইন, প্রিন্ট ও ডিজাইন সেবা দেওয়া — জেলার বাইরে না গিয়েই।',
  'বরগুনার মানুষ যখনই ডিজাইন, প্রিন্ট বা সাইনবোর্ডের প্রয়োজন অনুভব করবে, তখনই যেন সবার আগে আমি আর্টের কথা মনে আসে।',
  '[
    {"title": "স্থানীয় ও সহজলভ্য", "description": "বরগুনাতেই অবস্থিত, সরাসরি কথা বলে কাজ বোঝানো সহজ।"},
    {"title": "ডিজাইন ও প্রোডাকশন একসাথে", "description": "যারা ডিজাইন করে, তারাই কাজটি তৈরি করে।"},
    {"title": "সব ধরনের ম্যাটেরিয়াল", "description": "PVC, ফোম বোর্ড, ফ্লেক্স, ভিনাইল ও প্রয়োজনীয় প্রিন্ট উপকরণ।"},
    {"title": "স্বচ্ছ মূল্য নির্ধারণ", "description": "কাজ শুরুর আগেই স্পষ্ট খরচ জানানো হয়।"}
  ]'::jsonb,
  '[
    {"title": "পরামর্শ", "description": "আপনার প্রয়োজন ও কাজের জায়গা সম্পর্কে জেনে নেওয়া হয়।"},
    {"title": "ডিজাইন", "description": "আপনার অনুমোদনের জন্য একটি ডিজাইন তৈরি করা হয়।"},
    {"title": "প্রোডাকশন", "description": "অনুমোদনের পর প্রিন্ট বা তৈরির কাজ শুরু হয়।"},
    {"title": "ডেলিভারি", "description": "সম্পূর্ণ ও ব্যবহারযোগ্য পণ্য আপনার হাতে পৌঁছে দেওয়া হয়।"}
  ]'::jsonb
)
on conflict (id) do update set
  heading = excluded.heading,
  story = excluded.story,
  mission = excluded.mission,
  vision = excluded.vision,
  why_choose_us = excluded.why_choose_us,
  process_steps = excluded.process_steps;

insert into services (
  title, description, icon, category, aspect_ratio, display_order,
  service_type, product_category, requires_delivery
) values
  ('ডিজিটাল সাইনবোর্ড', 'আপনার দোকান বা ব্যবসার জন্য আকর্ষণীয় ও টেকসই সাইনবোর্ড ডিজাইন ও তৈরি।', 'signpost', 'সাইন ও সাইনবোর্ড', 'landscape-16-9', 0, 'physical', 'signboard', true),
  ('ব্যানার ও ফ্লেক্স প্রিন্ট', 'যেকোনো অনুষ্ঠান, প্রচারণা বা দোকানের জন্য মানসম্মত ব্যানার ও ফ্লেক্স প্রিন্টিং।', 'flag', 'প্রিন্টিং', 'wide-3-1', 1, 'physical', 'banner', true),
  ('পোস্টার', 'প্রচার ও বিজ্ঞাপনের জন্য আকর্ষণীয় পোস্টার ডিজাইন ও প্রিন্ট।', 'image', 'প্রিন্টিং', 'portrait-4-5', 2, 'physical', 'print_other', true),
  ('ভিজিটিং কার্ড', 'পেশাদার ও রুচিসম্মত ভিজিটিং কার্ড ডিজাইন ও প্রিন্ট।', 'credit-card', 'ব্র্যান্ডিং', 'standard-4-3', 3, 'physical', 'print_other', true),
  ('লিফলেট', 'আপনার ব্যবসার প্রচারের জন্য লিফলেট ও ফ্লায়ার ডিজাইন।', 'file-text', 'প্রচারমূলক ডিজাইন', 'portrait-4-5', 4, 'physical', 'print_other', true),
  ('প্যাড / পানা', 'অফিস ও প্রতিষ্ঠানের জন্য লেটারহেড প্যাড ও পানা প্রিন্ট।', 'layers', 'প্রিন্টিং', 'standard-4-3', 5, 'physical', 'print_other', true),
  ('সিল / স্ট্যাম্প', 'প্রতিষ্ঠান ও ব্যক্তিগত প্রয়োজনে রাবার সিল ও স্ট্যাম্প তৈরি।', 'stamp', 'অন্যান্য', 'square-1-1', 6, 'physical', 'print_other', true),
  ('বিলবোর্ড', 'বড় পরিসরে প্রচারের জন্য বিলবোর্ড ডিজাইন ও স্থাপন।', 'signpost', 'সাইন ও সাইনবোর্ড', 'wide-3-1', 7, 'physical', 'signboard', true),
  ('PVC / Foam Board', 'টেকসই ও উন্নত মানের PVC এবং ফোম বোর্ড প্রিন্টিং।', 'layout-panel-left', 'সাইন ও সাইনবোর্ড', 'landscape-16-9', 8, 'physical', 'signboard', true),
  ('লোগো ডিজাইন', 'আপনার ব্র্যান্ডের জন্য অনন্য ও স্মরণীয় লোগো ডিজাইন।', 'pen-tool', 'গ্রাফিক ডিজাইন', 'square-1-1', 9, 'digital', 'print_other', false),
  ('গ্রাফিক ডিজাইন', 'সব ধরনের ব্যবসায়িক ও সৃজনশীল গ্রাফিক ডিজাইন সেবা।', 'palette', 'গ্রাফিক ডিজাইন', 'standard-4-3', 10, 'digital', 'print_other', false),
  ('সোশ্যাল মিডিয়া ডিজাইন', 'ফেসবুক ও অন্যান্য সোশ্যাল মিডিয়ার জন্য আকর্ষণীয় ডিজাইন।', 'share-2', 'প্রচারমূলক ডিজাইন', 'square-1-1', 11, 'digital', 'print_other', false),
  ('ফটো এডিটিং', 'পেশাদার মানের ছবি সম্পাদনা ও রিটাচিং সেবা।', 'camera', 'গ্রাফিক ডিজাইন', 'standard-4-3', 12, 'digital', 'print_other', false),
  ('মগ প্রিন্ট', 'আপনার পছন্দের ছবি, নাম, লোগো বা ডিজাইন দিয়ে কাস্টম মগ প্রিন্টের অর্ডার করতে পারেন।', 'image', 'অন্যান্য', 'square-1-1', 13, 'physical', 'mug', true),
  ('টি-শার্ট প্রিন্ট', 'আপনার পছন্দের ডিজাইন, লোগো বা লেখা দিয়ে কাস্টম টি-শার্ট প্রিন্ট করতে পারেন।', 'layers', 'অন্যান্য', 'portrait-4-5', 14, 'physical', 'tshirt', true),
  ('জার্সি প্রিন্ট', 'নাম, নম্বর, লোগো ও ডিজাইন সহ কাস্টম স্পোর্টস জার্সি প্রিন্ট।', 'badge-check', 'অন্যান্য', 'portrait-4-5', 15, 'physical', 'jersey', true),
  ('১ পেজ ল্যান্ডিং পেজ ডিজাইন ও ডেভেলপমেন্ট', 'আপনার ব্যবসাকে অনলাইনে নিয়ে আসার জন্য সুন্দর, আধুনিক ও মোবাইল-ফ্রেন্ডলি ১ পেজ ল্যান্ডিং পেজ তৈরি করে দিই।', 'layout-panel-left', 'গ্রাফিক ডিজাইন', 'landscape-16-9', 16, 'digital', 'website', false)
on conflict (title) do nothing;
