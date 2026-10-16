import { PageHeader } from "@/components/admin/PageHeader";
import { ContactSettingsForm } from "./ContactSettingsForm";
import { MessagesList } from "./MessagesList";
import { ContactTabs } from "./ContactTabs";
import { getContactSettings } from "@/lib/queries/site";
import { getContactMessages, getUnreadMessageCount } from "@/lib/queries/messages";

export default async function ContactAdminPage() {
  const [contactSettings, messages, unreadCount] = await Promise.all([
    getContactSettings(),
    getContactMessages(),
    getUnreadMessageCount(),
  ]);

  return (
    <div>
      <PageHeader
        title="যোগাযোগ"
        description="আপনার যোগাযোগের তথ্য পরিচালনা করুন ও ওয়েবসাইট থেকে আসা মেসেজ দেখুন।"
      />
      <ContactTabs
        unreadCount={unreadCount}
        infoPanel={<ContactSettingsForm contactSettings={contactSettings} />}
        messagesPanel={<MessagesList messages={messages} />}
      />
    </div>
  );
}

export const dynamic = "force-dynamic";
