export interface AppDocument {
  $id: string;
  $createdAt: string;
  user_id?: string;
  store_url?: string;
  app_name?: string;
  theme_color?: string;
  icon_id?: string;
  admob_app_id?: string;
  admob_banner_unit_id?: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
