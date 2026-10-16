import { cache } from "react";
import { createAnonClient } from "@/lib/supabase/server";
import type { AboutContent, ContactSettings, Logos, SiteSettings } from "@/lib/types";

const FALLBACK_SITE_SETTINGS: SiteSettings = {
  id: 1,
  business_name: "Ami Art",
  tagline: "বরগুনায় ডিজিটাল সাইন, প্রিন্টিং ও ক্রিয়েটিভ ডিজাইন",
  intro_heading: "বরগুনায় সাইন, প্রিন্ট ও ডিজাইনের বিশ্বস্ত ঠিকানা",
  intro_body:
    "আমি আর্ট বরগুনা ভিত্তিক একটি ডিজিটাল সাইন, প্রিন্টিং ও ডিজাইন প্রতিষ্ঠান। আমরা PVC ও ফোম বোর্ড, ব্যানার, ফ্লেক্স প্রিন্ট এবং কাস্টম গ্রাফিক ডিজাইনের কাজ করি — যত্ন সহকারে, চাহিদা অনুযায়ী।",
  trust_badges: [
    { title: "বরগুনা ভিত্তিক", description: "নজরুল ইসলাম রোডে স্থানীয়ভাবে পরিচালিত।" },
    { title: "সম্পূর্ণ সেবা", description: "সাইন, প্রিন্ট ও ডিজাইন — সব একই জায়গায়।" },
    { title: "চাহিদা অনুযায়ী কাজ", description: "প্রতিটি কাজ আপনার প্রয়োজন অনুযায়ী তৈরি করা হয়।" },
  ],
  home_highlights: [
    { title: "মানসম্মত কাজ", description: "ফাইল থেকে চূড়ান্ত পণ্য পর্যন্ত যত্নসহকারে তৈরি।" },
    { title: "সৃজনশীল চিন্তা", description: "সাধারণ টেমপ্লেট নয়, আপনার ব্র্যান্ডের উপযোগী ডিজাইন।" },
    { title: "নির্ভরযোগ্য সময়", description: "কাজ শুরুর আগেই স্পষ্ট সময়সীমা জানানো হয়।" },
    { title: "গ্রাহক অগ্রাধিকার", description: "পুরো কাজ জুড়ে সরাসরি যোগাযোগ।" },
  ],
  capability_highlights: [
    { title: "ডিজাইন", description: "গ্রাফিক ও ব্র্যান্ডিং সেবা।" },
    { title: "প্রিন্টিং", description: "বিভিন্ন ধরনের প্রিন্টিং সেবা।" },
    { title: "কাস্টম প্রিন্ট", description: "মগ, টি-শার্ট, জার্সি ও অন্যান্য কাস্টম প্রিন্ট।" },
    { title: "ওয়েবসাইট", description: "ব্যবসাকে অনলাইনে আনার জন্য ১ পেজ ল্যান্ডিং পেজ।" },
    { title: "হোম ডেলিভারি", description: "প্রয়োজনে কুরিয়ারের মাধ্যমে পণ্য গ্রহণের সুবিধা।" },
  ],
  delivery_settings: {
    courier_fee: 0,
    local_delivery_fee: 0,
    free_delivery_threshold: null,
    enabled: true,
  },
  meta_title: "আমি আর্ট — বরগুনায় ডিজিটাল সাইন, প্রিন্টিং ও ডিজাইন",
  meta_description:
    "বরগুনার আমি আর্ট থেকে ডিজিটাল সাইনবোর্ড, ব্যানার-ফ্লেক্স প্রিন্ট, লোগো ও গ্রাফিক ডিজাইন সেবা।",
  og_image_url: null,
  updated_at: new Date(0).toISOString(),
};

const FALLBACK_CONTACT_SETTINGS: ContactSettings = {
  id: 1,
  phone: "01728-874204",
  email: "amiart54@gmail.com",
  address: "নজরুল ইসলাম রোড, বরগুনা",
  map_embed_url:
    "https://www.google.com/maps?q=" +
    encodeURIComponent("Nazrul Islam Road, Barguna, Bangladesh") +
    "&output=embed",
  social_links: [],
  updated_at: new Date(0).toISOString(),
};

const FALLBACK_ABOUT_CONTENT: AboutContent = {
  id: 1,
  heading: "আমি আর্ট সম্পর্কে",
  story:
    "আমি আর্ট বরগুনার নজরুল ইসলাম রোডে অবস্থিত একটি ডিজিটাল সাইন, প্রিন্টিং ও গ্রাফিক ডিজাইন প্রতিষ্ঠান। আমরা স্থানীয় দোকান, অফিস ও প্রতিষ্ঠানের জন্য সাইনবোর্ড, ব্যানার থেকে শুরু করে ভিজিটিং কার্ড ও প্রচারমূলক প্রিন্ট পর্যন্ত সব ধরনের কাজ করি — ডিজাইন ও প্রোডাকশন একসাথে সামলাই, যাতে চূড়ান্ত কাজ ঠিক আপনার চাহিদা অনুযায়ী হয়।",
  mission:
    "বরগুনার ব্যবসাগুলোকে পেশাদার মানের সাইন, প্রিন্ট ও ডিজাইন সেবা দেওয়া — জেলার বাইরে না গিয়েই।",
  vision:
    "বরগুনার মানুষ যখনই ডিজাইন, প্রিন্ট বা সাইনবোর্ডের প্রয়োজন অনুভব করবে, তখনই যেন সবার আগে আমি আর্টের কথা মনে আসে।",
  why_choose_us: [
    { title: "স্থানীয় ও সহজলভ্য", description: "বরগুনাতেই অবস্থিত, সরাসরি কথা বলে কাজ বোঝানো সহজ।" },
    { title: "ডিজাইন ও প্রোডাকশন একসাথে", description: "যারা ডিজাইন করে, তারাই কাজটি তৈরি করে।" },
    { title: "সব ধরনের ম্যাটেরিয়াল", description: "PVC, ফোম বোর্ড, ফ্লেক্স, ভিনাইল ও প্রয়োজনীয় প্রিন্ট উপকরণ।" },
    { title: "স্বচ্ছ মূল্য নির্ধারণ", description: "কাজ শুরুর আগেই স্পষ্ট খরচ জানানো হয়।" },
  ],
  process_steps: [
    { title: "পরামর্শ", description: "আপনার প্রয়োজন ও কাজের জায়গা সম্পর্কে জেনে নেওয়া হয়।" },
    { title: "ডিজাইন", description: "আপনার অনুমোদনের জন্য একটি ডিজাইন তৈরি করা হয়।" },
    { title: "প্রোডাকশন", description: "অনুমোদনের পর প্রিন্ট বা তৈরির কাজ শুরু হয়।" },
    { title: "ডেলিভারি", description: "সম্পূর্ণ ও ব্যবহারযোগ্য পণ্য আপনার হাতে পৌঁছে দেওয়া হয়।" },
  ],
  image_url: null,
  owner_image_url: null,
  owner_name: null,
  owner_designation: null,
  owner_short_bio: null,
  owner_bio: null,
  owner_experience: null,
  owner_location: null,
  owner_phone: null,
  owner_email: null,
  owner_cta_text: null,
  owner_cta_link: null,
  owner_show: false,
  updated_at: new Date(0).toISOString(),
};

const FALLBACK_LOGOS: Logos = {
  id: 1,
  primary_logo_url: null,
  light_logo_url: null,
  dark_logo_url: null,
  favicon_url: null,
  updated_at: new Date(0).toISOString(),
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    return data ?? FALLBACK_SITE_SETTINGS;
  } catch {
    return FALLBACK_SITE_SETTINGS;
  }
});

export const getContactSettings = cache(async (): Promise<ContactSettings> => {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from("contact_settings").select("*").eq("id", 1).maybeSingle();
    return data ?? FALLBACK_CONTACT_SETTINGS;
  } catch {
    return FALLBACK_CONTACT_SETTINGS;
  }
});

export const getAboutContent = cache(async (): Promise<AboutContent> => {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from("about_content").select("*").eq("id", 1).maybeSingle();
    return data ?? FALLBACK_ABOUT_CONTENT;
  } catch {
    return FALLBACK_ABOUT_CONTENT;
  }
});

export const getLogos = cache(async (): Promise<Logos> => {
  try {
    const supabase = createAnonClient();
    const { data } = await supabase.from("logos").select("*").eq("id", 1).maybeSingle();
    return data ?? FALLBACK_LOGOS;
  } catch {
    return FALLBACK_LOGOS;
  }
});
