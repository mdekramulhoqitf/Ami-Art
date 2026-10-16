import { ChevronDown } from "lucide-react";

function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-BD")}`;
}

/** Every line here is a direct restatement of a real, currently-enforced
    rule in the referral engine (0014/0016 migrations + their triggers) —
    nothing here is aspirational copy. Where a rule is displayed but not
    actually enforced server-side (the minimum-redemption hint), the wording
    stays soft ("সাধারণত") rather than asserting a guarantee that doesn't
    exist in code. */
export function ReferralRulesSection({
  commissionRatePercent,
  minRedemption,
}: {
  commissionRatePercent: number | null;
  minRedemption: number | null;
}) {
  const ratePercent = commissionRatePercent ?? 3;

  const rules: { title: string; body: string }[] = [
    {
      title: "কারা রেফারেল সুবিধা পাবেন",
      body: "যেসব গ্রাহক AMI ART-এ অন্তত একটি বৈধ (বাতিল নয়) অর্ডার করেছেন, তারা রেফারেল কোড তৈরি করতে পারবেন।",
    },
    {
      title: "কীভাবে রেফার করবেন",
      body: "আপনার কোড বা লিংক বন্ধুকে পাঠান। তিনি সেই লিংক দিয়ে অর্ডার করলে, অর্ডারটি স্বয়ংক্রিয়ভাবে আপনার রেফারেল হিসেবে যুক্ত হয়।",
    },
    {
      title: "কমিশন কত",
      body: `যোগ্য অর্ডারের নেট মূল্যের ${ratePercent}% রেফারেল কমিশন হিসেবে পাবেন।`,
    },
    {
      title: "কমিশন কীভাবে হিসাব হয়",
      body: `অর্ডারের মূল কাজের মূল্য (সাবটোটাল) থেকে ছাড় বাদ দিয়ে যা থাকে, তার ${ratePercent}%। ডিজাইন চার্জ, ডেলিভারি ও কুরিয়ার চার্জ এই হিসাবের বাইরে থাকে।`,
    },
    {
      title: "কখন কমিশন অনুমোদিত হয়",
      body: "রেফার করা অর্ডারের বিল (ইনভয়েস) তৈরি হলে এবং অর্ডারটি বাতিল না থাকলে, কমিশন অনুমোদিত (Approved) হয়ে আপনার Reward-এ যোগ হয়।",
    },
    {
      title: "অর্ডার বাতিল হলে কী হয়",
      body: "রেফার করা অর্ডারটি বাতিল হয়ে গেলে সেই অর্ডারের রেফারেল কমিশন বাতিল হয়ে যায় — অনুমোদিত থাকলেও তা প্রত্যাহার হয়।",
    },
    {
      title: "নিজের রেফারেল কোড নিজে ব্যবহার",
      body: "নিজের অর্ডারে নিজের রেফারেল কোড ব্যবহার করে কমিশন পাওয়া যাবে না। সিস্টেম এটি স্বয়ংক্রিয়ভাবে শনাক্ত করে বাতিল করে দেয়।",
    },
    {
      title: "একই অর্ডারে একাধিকবার কমিশন",
      body: "একটি অর্ডারের জন্য সর্বোচ্চ একবারই রেফারেল কমিশন গণনা করা হয়।",
    },
    {
      title: "কমিশন কোথায় জমা হয়",
      body: "অনুমোদিত কমিশন আপনার AMI ART Reward-এ (এই পাতায় প্রদর্শিত) জমা হয় — সরাসরি নগদ পাঠানো হয় না।",
    },
    {
      title: "Reward কীভাবে ব্যবহার করবেন",
      body: "আপনার কোনো অর্ডারের বিল পরিশোধের সময় Reward থেকে টাকা বাদ দেওয়া (Redeem) যায়। এটি AMI ART-এর নির্ধারিত রিডেম্পশন সুবিধা — সরাসরি নগদ উত্তোলনযোগ্য নয়।",
    },
    ...(minRedemption
      ? [
          {
            title: "সর্বনিম্ন Redemption",
            body: `Reward ব্যবহারযোগ্য দেখানো হয় সাধারণত Available ব্যালেন্স ${formatTaka(minRedemption)} বা তার বেশি হলে।`,
          },
        ]
      : []),
    {
      title: "ভুল বা অস্বাভাবিক রেফারেল সংশোধন",
      body: "এই নিয়মটি বর্তমানে সিস্টেমে নির্ধারিত নেই — owner decision required.",
    },
  ];

  return (
    <details className="mt-8 group rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-ink">
        রেফারেল নিয়মাবলি
        <ChevronDown className="h-4 w-4 text-ink-faint transition-transform group-open:rotate-180" />
      </summary>
      <ul className="mt-5 space-y-4 border-t border-border pt-5">
        {rules.map((rule) => (
          <li key={rule.title}>
            <p className="text-sm font-medium text-ink">{rule.title}</p>
            <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{rule.body}</p>
          </li>
        ))}
      </ul>
    </details>
  );
}
