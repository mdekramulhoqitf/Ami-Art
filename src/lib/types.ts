export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type HighlightItem = { title: string; description: string };
export type SocialLink = { platform: string; url: string };
export type ProcessStep = { title: string; description: string };

export type AspectRatio =
  | "landscape-16-9"
  | "wide-3-1"
  | "standard-4-3"
  | "square-1-1"
  | "portrait-4-5"
  | "vertical-9-16"
  | "custom";

export type OrderStatus = "new" | "viewed" | "contacted" | "in_progress" | "completed" | "cancelled";
export type MessageSender = "customer" | "admin";
export type MessageType = "text" | "invoice";

export type ServiceKind = "digital" | "physical";
export type ProductCategory = "banner" | "signboard" | "mug" | "tshirt" | "jersey" | "website" | "print_other";
export type DeliveryMethod = "pickup" | "courier" | "local_delivery" | "other";
export type PricingModel =
  | "PER_SQFT"
  | "PER_PIECE"
  | "FIXED"
  | "PER_PACKAGE"
  | "DESIGN_ONLY"
  | "PER_SQFT_PLUS_DESIGN"
  | "PER_PIECE_PLUS_DESIGN"
  | "CUSTOM";
export type InvoiceStatus = "draft" | "sent" | "pending" | "paid" | "partial" | "cancelled";

export type VerificationStatus = "verified" | "unverified" | "needs_review" | "outdated";
export type BusinessStatus = "prospect" | "lead" | "customer" | "inactive";
export type PriorityLevel = "low" | "normal" | "high" | "urgent";
export type BusinessSourceType =
  | "google_maps"
  | "facebook"
  | "instagram"
  | "website"
  | "local_directory"
  | "offline_research"
  | "customer_referral"
  | "existing_customer"
  | "manual_entry";
export type OpportunityStage =
  | "new"
  | "researching"
  | "qualified"
  | "contacted"
  | "interested"
  | "quotation_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "follow_up";
export type QuotationStatus = "draft" | "sent" | "viewed" | "negotiating" | "accepted" | "rejected" | "expired";
export type ActivityType =
  | "created"
  | "researched"
  | "contacted"
  | "message_sent"
  | "call_made"
  | "response_received"
  | "quotation_sent"
  | "followup"
  | "status_changed"
  | "note_added"
  | "won"
  | "lost"
  | "customer_created"
  | "order_placed"
  | "reward_earned"
  | "reward_redeemed";
export type AdminRole = "owner" | "staff" | "marketing" | "sales";

export type FollowUpReason =
  | "new_lead"
  | "interested_lead"
  | "quotation_sent"
  | "quotation_pending"
  | "negotiation"
  | "order_confirmation"
  | "production_update"
  | "delivery"
  | "post_order_checkin"
  | "repeat_opportunity"
  | "other";
export type FollowUpStatus = "pending" | "completed" | "skipped";

export type LoyaltyLevel = "new" | "returning" | "loyal" | "vip";
export type RewardType = "welcome" | "repeat" | "referral" | "milestone" | "campaign" | "redemption";
export type ReferralStatus = "pending" | "approved" | "rejected";
export type RedemptionStatus = "applied" | "reversed";

export type LeadScoreFactor = { label: string; points: number };

export type SectionBannerSlug = "about" | "services" | "portfolio" | "why_choose_us" | "contact";
export type SectionBannerPosition = "center" | "top" | "bottom" | "left" | "right";
export type SectionBannerOverlayStyle = "dark" | "light";

export type DeliverySettings = {
  courier_fee: number;
  local_delivery_fee: number;
  free_delivery_threshold: number | null;
  enabled: boolean;
};

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: {
          id: number;
          business_name: string;
          tagline: string;
          intro_heading: string;
          intro_body: string;
          trust_badges: HighlightItem[];
          home_highlights: HighlightItem[];
          capability_highlights: HighlightItem[];
          delivery_settings: DeliverySettings;
          meta_title: string;
          meta_description: string;
          og_image_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          business_name?: string;
          tagline?: string;
          intro_heading?: string;
          intro_body?: string;
          trust_badges?: HighlightItem[];
          home_highlights?: HighlightItem[];
          capability_highlights?: HighlightItem[];
          delivery_settings?: DeliverySettings;
          meta_title?: string;
          meta_description?: string;
          og_image_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          business_name?: string;
          tagline?: string;
          intro_heading?: string;
          intro_body?: string;
          trust_badges?: HighlightItem[];
          home_highlights?: HighlightItem[];
          capability_highlights?: HighlightItem[];
          delivery_settings?: DeliverySettings;
          meta_title?: string;
          meta_description?: string;
          og_image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      logos: {
        Row: {
          id: number;
          primary_logo_url: string | null;
          light_logo_url: string | null;
          dark_logo_url: string | null;
          favicon_url: string | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          primary_logo_url?: string | null;
          light_logo_url?: string | null;
          dark_logo_url?: string | null;
          favicon_url?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          primary_logo_url?: string | null;
          light_logo_url?: string | null;
          dark_logo_url?: string | null;
          favicon_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      hero_slides: {
        Row: {
          id: string;
          image_url: string;
          mobile_image_url: string | null;
          alt_text: string | null;
          title: string | null;
          subtitle: string | null;
          cta_label: string | null;
          cta_url: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          mobile_image_url?: string | null;
          alt_text?: string | null;
          title?: string | null;
          subtitle?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          mobile_image_url?: string | null;
          alt_text?: string | null;
          title?: string | null;
          subtitle?: string | null;
          cta_label?: string | null;
          cta_url?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          icon: string | null;
          price: string | null;
          category: string | null;
          image_url: string | null;
          image_path: string | null;
          image_alt: string | null;
          aspect_ratio: AspectRatio;
          custom_width: number | null;
          custom_height: number | null;
          service_type: ServiceKind;
          product_category: ProductCategory;
          requires_delivery: boolean;
          is_active: boolean;
          display_order: number;
          pricing_model: PricingModel;
          rate: number | null;
          design_fee: number;
          source_file_fee: number;
          minimum_charge: number | null;
          minimum_quantity: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          icon?: string | null;
          price?: string | null;
          category?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          image_alt?: string | null;
          aspect_ratio?: AspectRatio;
          custom_width?: number | null;
          custom_height?: number | null;
          service_type?: ServiceKind;
          product_category?: ProductCategory;
          requires_delivery?: boolean;
          is_active?: boolean;
          display_order?: number;
          pricing_model?: PricingModel;
          rate?: number | null;
          design_fee?: number;
          source_file_fee?: number;
          minimum_charge?: number | null;
          minimum_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          icon?: string | null;
          price?: string | null;
          category?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          image_alt?: string | null;
          aspect_ratio?: AspectRatio;
          custom_width?: number | null;
          custom_height?: number | null;
          service_type?: ServiceKind;
          product_category?: ProductCategory;
          requires_delivery?: boolean;
          is_active?: boolean;
          display_order?: number;
          pricing_model?: PricingModel;
          rate?: number | null;
          design_fee?: number;
          source_file_fee?: number;
          minimum_charge?: number | null;
          minimum_quantity?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      about_content: {
        Row: {
          id: number;
          heading: string;
          story: string;
          mission: string;
          vision: string;
          why_choose_us: HighlightItem[];
          process_steps: ProcessStep[];
          image_url: string | null;
          owner_image_url: string | null;
          owner_name: string | null;
          owner_designation: string | null;
          owner_short_bio: string | null;
          owner_bio: string | null;
          owner_experience: string | null;
          owner_location: string | null;
          owner_phone: string | null;
          owner_email: string | null;
          owner_cta_text: string | null;
          owner_cta_link: string | null;
          owner_show: boolean;
          updated_at: string;
        };
        Insert: {
          id?: number;
          heading?: string;
          story?: string;
          mission?: string;
          vision?: string;
          why_choose_us?: HighlightItem[];
          process_steps?: ProcessStep[];
          image_url?: string | null;
          owner_image_url?: string | null;
          owner_name?: string | null;
          owner_designation?: string | null;
          owner_short_bio?: string | null;
          owner_bio?: string | null;
          owner_experience?: string | null;
          owner_location?: string | null;
          owner_phone?: string | null;
          owner_email?: string | null;
          owner_cta_text?: string | null;
          owner_cta_link?: string | null;
          owner_show?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: number;
          heading?: string;
          story?: string;
          mission?: string;
          vision?: string;
          why_choose_us?: HighlightItem[];
          process_steps?: ProcessStep[];
          image_url?: string | null;
          owner_image_url?: string | null;
          owner_name?: string | null;
          owner_designation?: string | null;
          owner_short_bio?: string | null;
          owner_bio?: string | null;
          owner_experience?: string | null;
          owner_location?: string | null;
          owner_phone?: string | null;
          owner_email?: string | null;
          owner_cta_text?: string | null;
          owner_cta_link?: string | null;
          owner_show?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_items: {
        Row: {
          id: string;
          title: string;
          category: string | null;
          description: string | null;
          image_url: string;
          alt_text: string | null;
          is_featured: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category?: string | null;
          description?: string | null;
          image_url: string;
          alt_text?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string | null;
          description?: string | null;
          image_url?: string;
          alt_text?: string | null;
          is_featured?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      faq_items: {
        Row: {
          id: string;
          question: string;
          answer: string;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      why_choose_us_items: {
        Row: {
          id: string;
          title: string;
          description: string;
          icon: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          icon?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          icon?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      section_banners: {
        Row: {
          slug: string;
          title: string | null;
          short_description: string | null;
          detailed_description: string | null;
          image_url: string | null;
          image_path: string | null;
          alt_text: string | null;
          image_position: SectionBannerPosition;
          overlay_enabled: boolean;
          overlay_style: SectionBannerOverlayStyle;
          is_visible: boolean;
          updated_at: string;
        };
        Insert: {
          slug: string;
          title?: string | null;
          short_description?: string | null;
          detailed_description?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          alt_text?: string | null;
          image_position?: SectionBannerPosition;
          overlay_enabled?: boolean;
          overlay_style?: SectionBannerOverlayStyle;
          is_visible?: boolean;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          title?: string | null;
          short_description?: string | null;
          detailed_description?: string | null;
          image_url?: string | null;
          image_path?: string | null;
          alt_text?: string | null;
          image_position?: SectionBannerPosition;
          overlay_enabled?: boolean;
          overlay_style?: SectionBannerOverlayStyle;
          is_visible?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_settings: {
        Row: {
          id: number;
          phone: string;
          email: string;
          address: string;
          map_embed_url: string | null;
          social_links: SocialLink[];
          updated_at: string;
        };
        Insert: {
          id?: number;
          phone?: string;
          email?: string;
          address?: string;
          map_embed_url?: string | null;
          social_links?: SocialLink[];
          updated_at?: string;
        };
        Update: {
          id?: number;
          phone?: string;
          email?: string;
          address?: string;
          map_embed_url?: string | null;
          social_links?: SocialLink[];
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          contact: string;
          service: string | null;
          message: string;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          contact: string;
          service?: string | null;
          message: string;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          contact?: string;
          service?: string | null;
          message?: string;
          created_at?: string;
          is_read?: boolean;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          access_token: string;
          business_id: string | null;
          customer_id: string | null;
          customer_name: string;
          phone: string;
          email: string | null;
          address: string | null;
          service_id: string | null;
          service_label: string;
          description: string;
          quantity: string | null;
          required_date: string | null;
          budget: string | null;
          delivery_required: boolean;
          delivery_method: DeliveryMethod | null;
          delivery_address: string | null;
          custom_fields: Json;
          pricing_snapshot: Json | null;
          status: OrderStatus;
          is_read: boolean;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          access_token?: string;
          business_id?: string | null;
          customer_id?: string | null;
          customer_name: string;
          phone: string;
          email?: string | null;
          address?: string | null;
          service_id?: string | null;
          service_label: string;
          description: string;
          quantity?: string | null;
          required_date?: string | null;
          budget?: string | null;
          delivery_required?: boolean;
          delivery_method?: DeliveryMethod | null;
          delivery_address?: string | null;
          custom_fields?: Json;
          pricing_snapshot?: Json | null;
          status?: OrderStatus;
          is_read?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          access_token?: string;
          business_id?: string | null;
          customer_id?: string | null;
          customer_name?: string;
          phone?: string;
          email?: string | null;
          address?: string | null;
          service_id?: string | null;
          service_label?: string;
          description?: string;
          quantity?: string | null;
          required_date?: string | null;
          budget?: string | null;
          delivery_required?: boolean;
          delivery_method?: DeliveryMethod | null;
          delivery_address?: string | null;
          custom_fields?: Json;
          pricing_snapshot?: Json | null;
          status?: OrderStatus;
          is_read?: boolean;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_attachments: {
        Row: {
          id: string;
          order_id: string;
          file_name: string;
          file_path: string;
          file_url: string;
          file_type: string;
          file_size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          file_name: string;
          file_path: string;
          file_url: string;
          file_type: string;
          file_size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          file_name?: string;
          file_path?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      order_messages: {
        Row: {
          id: string;
          order_id: string;
          sender_type: MessageSender;
          message_type: MessageType;
          invoice_id: string | null;
          message: string;
          attachment_path: string | null;
          attachment_name: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          sender_type: MessageSender;
          message_type?: MessageType;
          invoice_id?: string | null;
          message: string;
          attachment_path?: string | null;
          attachment_name?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          sender_type?: MessageSender;
          message_type?: MessageType;
          invoice_id?: string | null;
          message?: string;
          attachment_path?: string | null;
          attachment_name?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          order_id: string;
          invoice_number: string;
          version: number;
          is_latest: boolean;
          access_token: string;
          invoice_date: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          customer_address: string | null;
          subtotal: number;
          design_charge: number;
          delivery_charge: number;
          courier_charge: number;
          other_charge: number;
          discount: number;
          total: number;
          paid_amount: number;
          due_amount: number;
          estimated_completion: string | null;
          delivery_method: DeliveryMethod | null;
          delivery_address: string | null;
          notes: string | null;
          status: InvoiceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          invoice_number: string;
          version?: number;
          is_latest?: boolean;
          access_token?: string;
          invoice_date?: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          customer_address?: string | null;
          subtotal?: number;
          design_charge?: number;
          delivery_charge?: number;
          courier_charge?: number;
          other_charge?: number;
          discount?: number;
          total?: number;
          paid_amount?: number;
          due_amount?: number;
          estimated_completion?: string | null;
          delivery_method?: DeliveryMethod | null;
          delivery_address?: string | null;
          notes?: string | null;
          status?: InvoiceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          invoice_number?: string;
          version?: number;
          is_latest?: boolean;
          access_token?: string;
          invoice_date?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          customer_address?: string | null;
          subtotal?: number;
          design_charge?: number;
          delivery_charge?: number;
          courier_charge?: number;
          other_charge?: number;
          discount?: number;
          total?: number;
          paid_amount?: number;
          due_amount?: number;
          estimated_completion?: string | null;
          delivery_method?: DeliveryMethod | null;
          delivery_address?: string | null;
          notes?: string | null;
          status?: InvoiceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          service_name: string;
          quantity: number;
          unit_price: number;
          total: number;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          service_name: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          service_name?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          subcategory: string | null;
          area: string | null;
          address: string | null;
          phone: string | null;
          website: string | null;
          facebook: string | null;
          instagram: string | null;
          google_maps_url: string | null;
          source: string | null;
          source_url: string | null;
          source_type: BusinessSourceType | null;
          collected_date: string | null;
          collected_by: string | null;
          verification_status: VerificationStatus;
          business_status: BusinessStatus;
          estimated_size: string | null;
          estimated_printing_need: string | null;
          estimated_printing_frequency: string | null;
          potential_value: number | null;
          priority_level: PriorityLevel | null;
          new_business_flag: boolean;
          rebranding_flag: boolean;
          promotional_activity_flag: boolean;
          seasonal_demand: string | null;
          existing_supplier_known: boolean;
          tags: string[];
          notes: string | null;
          owner_admin_id: string | null;
          last_contact_at: string | null;
          next_followup_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          subcategory?: string | null;
          area?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          facebook?: string | null;
          instagram?: string | null;
          google_maps_url?: string | null;
          source?: string | null;
          source_url?: string | null;
          source_type?: BusinessSourceType | null;
          collected_date?: string | null;
          collected_by?: string | null;
          verification_status?: VerificationStatus;
          business_status?: BusinessStatus;
          estimated_size?: string | null;
          estimated_printing_need?: string | null;
          estimated_printing_frequency?: string | null;
          potential_value?: number | null;
          priority_level?: PriorityLevel | null;
          new_business_flag?: boolean;
          rebranding_flag?: boolean;
          promotional_activity_flag?: boolean;
          seasonal_demand?: string | null;
          existing_supplier_known?: boolean;
          tags?: string[];
          notes?: string | null;
          owner_admin_id?: string | null;
          last_contact_at?: string | null;
          next_followup_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          subcategory?: string | null;
          area?: string | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          facebook?: string | null;
          instagram?: string | null;
          google_maps_url?: string | null;
          source?: string | null;
          source_url?: string | null;
          source_type?: BusinessSourceType | null;
          collected_date?: string | null;
          collected_by?: string | null;
          verification_status?: VerificationStatus;
          business_status?: BusinessStatus;
          estimated_size?: string | null;
          estimated_printing_need?: string | null;
          estimated_printing_frequency?: string | null;
          potential_value?: number | null;
          priority_level?: PriorityLevel | null;
          new_business_flag?: boolean;
          rebranding_flag?: boolean;
          promotional_activity_flag?: boolean;
          seasonal_demand?: string | null;
          existing_supplier_known?: boolean;
          tags?: string[];
          notes?: string | null;
          owner_admin_id?: string | null;
          last_contact_at?: string | null;
          next_followup_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_contacts: {
        Row: {
          id: string;
          business_id: string;
          name: string;
          role: string | null;
          phone: string | null;
          email: string | null;
          is_primary: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          name: string;
          role?: string | null;
          phone?: string | null;
          email?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          name?: string;
          role?: string | null;
          phone?: string | null;
          email?: string | null;
          is_primary?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          business_id: string;
          contact_id: string | null;
          title: string;
          service_category: string | null;
          stage: OpportunityStage;
          estimated_value: number | null;
          lead_score: number;
          lead_score_breakdown: LeadScoreFactor[];
          assigned_admin_id: string | null;
          won_lost_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id: string;
          contact_id?: string | null;
          title: string;
          service_category?: string | null;
          stage?: OpportunityStage;
          estimated_value?: number | null;
          lead_score?: number;
          lead_score_breakdown?: LeadScoreFactor[];
          assigned_admin_id?: string | null;
          won_lost_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string;
          contact_id?: string | null;
          title?: string;
          service_category?: string | null;
          stage?: OpportunityStage;
          estimated_value?: number | null;
          lead_score?: number;
          lead_score_breakdown?: LeadScoreFactor[];
          assigned_admin_id?: string | null;
          won_lost_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          business_id: string | null;
          opportunity_id: string | null;
          order_id: string | null;
          customer_id: string | null;
          type: ActivityType;
          body: string | null;
          admin_id: string | null;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          opportunity_id?: string | null;
          order_id?: string | null;
          customer_id?: string | null;
          type: ActivityType;
          body?: string | null;
          admin_id?: string | null;
          occurred_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          opportunity_id?: string | null;
          order_id?: string | null;
          customer_id?: string | null;
          type?: ActivityType;
          body?: string | null;
          admin_id?: string | null;
          occurred_at?: string;
        };
        Relationships: [];
      };
      customers: {
        Row: {
          id: string;
          customer_number: string;
          name: string;
          phone: string;
          email: string | null;
          area: string | null;
          business_id: string | null;
          preferences: Json;
          total_orders: number;
          last_order_at: string | null;
          loyalty_level: LoyaltyLevel;
          referral_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_number?: string;
          name: string;
          phone: string;
          email?: string | null;
          area?: string | null;
          business_id?: string | null;
          preferences?: Json;
          total_orders?: number;
          last_order_at?: string | null;
          loyalty_level?: LoyaltyLevel;
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_number?: string;
          name?: string;
          phone?: string;
          email?: string | null;
          area?: string | null;
          business_id?: string | null;
          preferences?: Json;
          total_orders?: number;
          last_order_at?: string | null;
          loyalty_level?: LoyaltyLevel;
          referral_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      referrals: {
        Row: {
          id: string;
          referrer_customer_id: string;
          referral_code: string;
          referred_order_id: string;
          referred_customer_id: string | null;
          status: ReferralStatus;
          commission_rate: number | null;
          eligible_value: number | null;
          commission_amount: number | null;
          redeemed_amount: number;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          referrer_customer_id: string;
          referral_code: string;
          referred_order_id: string;
          referred_customer_id?: string | null;
          status?: ReferralStatus;
          commission_rate?: number | null;
          eligible_value?: number | null;
          commission_amount?: number | null;
          redeemed_amount?: number;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          referrer_customer_id?: string;
          referral_code?: string;
          referred_order_id?: string;
          referred_customer_id?: string | null;
          status?: ReferralStatus;
          commission_rate?: number | null;
          eligible_value?: number | null;
          commission_amount?: number | null;
          redeemed_amount?: number;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      reward_redemptions: {
        Row: {
          id: string;
          customer_id: string;
          order_id: string;
          amount: number;
          status: RedemptionStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          order_id: string;
          amount: number;
          status?: RedemptionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          order_id?: string;
          amount?: number;
          status?: RedemptionStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      customer_rewards: {
        Row: {
          id: string;
          customer_id: string;
          points: number;
          type: RewardType;
          reason: string | null;
          related_order_id: string | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          points: number;
          type: RewardType;
          reason?: string | null;
          related_order_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          points?: number;
          type?: RewardType;
          reason?: string | null;
          related_order_id?: string | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reward_rules: {
        Row: {
          id: string;
          rule_key: string;
          points: number | null;
          rate: number | null;
          is_active: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rule_key: string;
          points?: number | null;
          rate?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rule_key?: string;
          points?: number | null;
          rate?: number | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotations: {
        Row: {
          id: string;
          quotation_number: string;
          opportunity_id: string;
          business_id: string;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          customer_address: string | null;
          subtotal: number;
          discount: number;
          delivery_charge: number;
          total: number;
          delivery_method: DeliveryMethod | null;
          delivery_address: string | null;
          status: QuotationStatus;
          sent_at: string | null;
          viewed_at: string | null;
          accepted_at: string | null;
          rejected_at: string | null;
          follow_up_at: string | null;
          order_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          quotation_number?: string;
          opportunity_id: string;
          business_id: string;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          customer_address?: string | null;
          subtotal?: number;
          discount?: number;
          delivery_charge?: number;
          total?: number;
          delivery_method?: DeliveryMethod | null;
          delivery_address?: string | null;
          status?: QuotationStatus;
          sent_at?: string | null;
          viewed_at?: string | null;
          accepted_at?: string | null;
          rejected_at?: string | null;
          follow_up_at?: string | null;
          order_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          quotation_number?: string;
          opportunity_id?: string;
          business_id?: string;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          customer_address?: string | null;
          subtotal?: number;
          discount?: number;
          delivery_charge?: number;
          total?: number;
          delivery_method?: DeliveryMethod | null;
          delivery_address?: string | null;
          status?: QuotationStatus;
          sent_at?: string | null;
          viewed_at?: string | null;
          accepted_at?: string | null;
          rejected_at?: string | null;
          follow_up_at?: string | null;
          order_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      quotation_items: {
        Row: {
          id: string;
          quotation_id: string;
          service_name: string;
          quantity: number;
          unit_price: number;
          total: number;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          service_name: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          quotation_id?: string;
          service_name?: string;
          quantity?: number;
          unit_price?: number;
          total?: number;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      admin_roles: {
        Row: {
          admin_id: string;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          admin_id: string;
          role: AdminRole;
          created_at?: string;
        };
        Update: {
          admin_id?: string;
          role?: AdminRole;
          created_at?: string;
        };
        Relationships: [];
      };
      follow_ups: {
        Row: {
          id: string;
          business_id: string | null;
          customer_id: string | null;
          opportunity_id: string | null;
          quotation_id: string | null;
          order_id: string | null;
          reason: FollowUpReason;
          scheduled_at: string;
          status: FollowUpStatus;
          notes: string | null;
          next_action: string | null;
          assigned_admin_id: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          business_id?: string | null;
          customer_id?: string | null;
          opportunity_id?: string | null;
          quotation_id?: string | null;
          order_id?: string | null;
          reason: FollowUpReason;
          scheduled_at: string;
          status?: FollowUpStatus;
          notes?: string | null;
          next_action?: string | null;
          assigned_admin_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          business_id?: string | null;
          customer_id?: string | null;
          opportunity_id?: string | null;
          quotation_id?: string | null;
          order_id?: string | null;
          reason?: FollowUpReason;
          scheduled_at?: string;
          status?: FollowUpStatus;
          notes?: string | null;
          next_action?: string | null;
          assigned_admin_id?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      submit_order: {
        Args: {
          p_customer_name: string;
          p_phone: string;
          p_email: string | null;
          p_address: string | null;
          p_service_id: string | null;
          p_service_label: string;
          p_description: string;
          p_quantity: string | null;
          p_required_date: string | null;
          p_budget: string | null;
          p_delivery_required: boolean;
          p_delivery_address: string | null;
          p_delivery_method?: string | null;
          p_custom_fields?: Json;
        };
        Returns: { id: string; order_number: string; access_token: string }[];
      };
      add_order_attachment: {
        Args: {
          p_order_id: string;
          p_file_name: string;
          p_file_path: string;
          p_file_url: string;
          p_file_type: string;
          p_file_size: number;
        };
        Returns: undefined;
      };
      get_order_by_token: {
        Args: { p_token: string };
        Returns: Json;
      };
      add_customer_reply: {
        Args: { p_token: string; p_message: string };
        Returns: boolean;
      };
      get_invoice_by_tokens: {
        Args: { p_order_token: string; p_invoice_token: string };
        Returns: Json;
      };
      next_invoice_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      next_order_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      next_quotation_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      accept_quotation: {
        Args: { p_quotation_id: string };
        Returns: { out_order_id: string; out_order_number: string; out_invoice_id: string }[];
      };
      next_customer_number: {
        Args: Record<string, never>;
        Returns: string;
      };
      check_returning_customer: {
        Args: { p_phone: string };
        Returns: { out_name: string }[];
      };
      link_customer_to_order: {
        Args: {
          p_order_id: string;
          p_name: string;
          p_phone: string;
          p_email: string | null;
          p_area: string | null;
          p_business_name: string | null;
        };
        Returns: {
          out_customer_id: string;
          out_customer_number: string;
          out_is_new: boolean;
          out_welcome_points: number;
        }[];
      };
      generate_referral_code: {
        Args: { p_customer_id: string };
        Returns: string;
      };
      get_referral_info_by_token: {
        Args: { p_token: string };
        Returns: { out_eligible: boolean; out_referral_code: string | null; out_commission_rate: number | null }[];
      };
      generate_referral_code_by_token: {
        Args: { p_token: string };
        Returns: string;
      };
      attribute_referral: {
        Args: { p_order_id: string; p_referral_code: string };
        Returns: undefined;
      };
      get_reward_wallet_by_token: {
        Args: { p_token: string };
        Returns: {
          out_available: number;
          out_pending: number;
          out_total_earned: number;
          out_redeemed: number;
          out_referral_count: number;
          out_min_redemption: number | null;
        }[];
      };
      get_reward_history_by_token: {
        Args: { p_token: string };
        Returns: {
          out_order_number: string;
          out_amount: number;
          out_status: string;
          out_created_at: string;
          out_eligible_value: number | null;
          out_commission_rate: number | null;
        }[];
      };
      get_order_redemption_by_token: {
        Args: { p_token: string };
        Returns: { out_amount: number; out_status: string }[];
      };
      redeem_reward_by_token: {
        Args: { p_token: string };
        Returns: {
          out_success: boolean;
          out_amount: number;
          out_new_available: number;
          out_message: string;
          out_min_redemption: number;
        }[];
      };
      get_customer_hub_by_token: {
        Args: { p_token: string };
        Returns: {
          out_customer_id: string;
          out_customer_number: string;
          out_customer_name: string;
          out_business_name: string | null;
          out_phone: string;
          out_total_orders: number;
          out_active_orders: number;
          out_completed_orders: number;
        }[];
      };
      get_customer_recent_orders_by_token: {
        Args: { p_token: string; p_limit?: number };
        Returns: {
          out_order_number: string;
          out_access_token: string;
          out_service_label: string;
          out_status: string;
          out_created_at: string;
          out_invoice_total: number | null;
          out_invoice_due: number | null;
        }[];
      };
      get_reorder_data_by_token: {
        Args: { p_token: string };
        Returns: {
          out_order_number: string;
          out_customer_name: string;
          out_phone: string;
          out_email: string | null;
          out_address: string | null;
          out_business_name: string | null;
          out_service_id: string | null;
          out_service_label: string;
          out_description: string;
          out_quantity: string | null;
          out_custom_fields: Json;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
export type Logos = Database["public"]["Tables"]["logos"]["Row"];
export type HeroSlide = Database["public"]["Tables"]["hero_slides"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type AboutContent = Database["public"]["Tables"]["about_content"]["Row"];
export type PortfolioItem = Database["public"]["Tables"]["portfolio_items"]["Row"];
export type FaqItem = Database["public"]["Tables"]["faq_items"]["Row"];
export type WhyChooseUsItem = Database["public"]["Tables"]["why_choose_us_items"]["Row"];
export type SectionBanner = Database["public"]["Tables"]["section_banners"]["Row"];
export type ContactSettings = Database["public"]["Tables"]["contact_settings"]["Row"];
export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderAttachment = Database["public"]["Tables"]["order_attachments"]["Row"];
export type OrderMessage = Database["public"]["Tables"]["order_messages"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceItem = Database["public"]["Tables"]["invoice_items"]["Row"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BusinessContact = Database["public"]["Tables"]["business_contacts"]["Row"];
export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
export type ActivityLogEntry = Database["public"]["Tables"]["activity_log"]["Row"];
export type Quotation = Database["public"]["Tables"]["quotations"]["Row"];
export type QuotationItem = Database["public"]["Tables"]["quotation_items"]["Row"];
export type AdminRoleRow = Database["public"]["Tables"]["admin_roles"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerReward = Database["public"]["Tables"]["customer_rewards"]["Row"];
export type RewardRule = Database["public"]["Tables"]["reward_rules"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type RewardRedemption = Database["public"]["Tables"]["reward_redemptions"]["Row"];
export type FollowUp = Database["public"]["Tables"]["follow_ups"]["Row"];

export type OrderWithCounts = Order & { unread_message_count?: number };

export type InvoiceMessageSummary = {
  invoice_number: string;
  access_token: string;
  total: number;
  paid_amount: number;
  due_amount: number;
  status: InvoiceStatus;
  estimated_completion: string | null;
};

export type CustomerOrderView = {
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  service_label: string;
  description: string;
  created_at: string;
  messages: {
    sender_type: MessageSender;
    message_type: MessageType;
    message: string;
    created_at: string;
    invoice: InvoiceMessageSummary | null;
  }[];
};

export type InvoiceLineItemView = {
  service_name: string;
  quantity: number;
  unit_price: number;
  total: number;
};

export type CustomerInvoiceView = {
  invoice_number: string;
  version: number;
  is_latest: boolean;
  invoice_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  subtotal: number;
  design_charge: number;
  delivery_charge: number;
  courier_charge: number;
  other_charge: number;
  discount: number;
  total: number;
  paid_amount: number;
  due_amount: number;
  estimated_completion: string | null;
  delivery_method: DeliveryMethod | null;
  delivery_address: string | null;
  notes: string | null;
  status: InvoiceStatus;
  order_number: string;
  items: InvoiceLineItemView[];
};
