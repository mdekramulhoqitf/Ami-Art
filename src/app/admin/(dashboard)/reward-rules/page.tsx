import { PageHeader } from "@/components/admin/PageHeader";
import { FormField, Input, Checkbox } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { getRewardRules } from "@/lib/queries/customers";
import { requireCapability } from "@/lib/permissions";
import { updateRewardRule } from "../customers/actions";

const RULE_LABELS: Record<string, { title: string; hint: string; rateLabel?: string }> = {
  welcome_bonus: {
    title: "স্বাগতম বোনাস",
    hint: "নতুন গ্রাহকের প্রথম অর্ডারে স্বয়ংক্রিয়ভাবে যে পয়েন্ট দেওয়া হয় (পয়েন্ট সংখ্যা)।",
  },
  redemption_rate: {
    title: "রিডেম্পশন রেট",
    hint: "প্রতি ১ পয়েন্টের বিনিময়ে কত টাকা ছাড় দেওয়া হবে (টাকা/পয়েন্ট)। যেমন: ০.৫ মানে ২ পয়েন্ট = ৳১।",
  },
  referral_commission: {
    title: "রেফারেল কমিশন",
    hint: "সফল রেফারেল অর্ডারের নিট মূল্যের (ডেলিভারি ও ছাড় বাদে) কত অংশ কমিশন হিসেবে দেওয়া হবে। যেমন: ০.০৩ মানে ৩%।",
    rateLabel: "হার (দশমিক ভগ্নাংশ, যেমন 0.03 = 3%)",
  },
  referral_min_redemption: {
    title: "সর্বনিম্ন রিডেম্পশন পরিমাণ",
    hint: "গ্রাহকের Available Reward এই পরিমাণে পৌঁছালে তবেই তিনি তা ব্যবহার করতে পারবেন (টাকায়)।",
    rateLabel: "সর্বনিম্ন পরিমাণ (৳)",
  },
};

export default async function RewardRulesPage() {
  await requireCapability("manage_settings");
  const rules = await getRewardRules();

  return (
    <div>
      <PageHeader
        title="রিওয়ার্ড নিয়মাবলী"
        description="AMI Points প্রোগ্রামের নিয়ম এখান থেকে নিয়ন্ত্রণ করুন — কোডে হার্ডকোড করা নেই।"
      />

      <div className="max-w-xl space-y-5">
        {rules.map((rule) => {
          const label = RULE_LABELS[rule.rule_key] ?? { title: rule.rule_key, hint: "" };
          const boundAction = updateRewardRule.bind(null, rule.rule_key);
          return (
            <form
              key={rule.id}
              action={boundAction}
              className="space-y-4 rounded-2xl border border-border bg-surface p-5"
            >
              <h2 className="text-sm font-semibold text-ink">{label.title}</h2>
              {rule.points !== null && (
                <FormField label="পয়েন্ট" name="points" hint={label.hint}>
                  <Input id="points" name="points" type="number" min={0} defaultValue={rule.points} />
                </FormField>
              )}
              {rule.rate !== null && (
                <FormField label={label.rateLabel ?? "হার (টাকা/পয়েন্ট)"} name="rate" hint={label.hint}>
                  <Input id="rate" name="rate" type="number" min={0} step="0.01" defaultValue={rule.rate} />
                </FormField>
              )}
              <Checkbox name="is_active" label="সক্রিয়" defaultChecked={rule.is_active} />
              <Button type="submit" size="sm">
                সংরক্ষণ করুন
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
