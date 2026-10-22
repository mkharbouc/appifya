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
  admob_interstitial_unit_id?: string;
  admob_rewarded_unit_id?: string;
  admob_app_open_unit_id?: string;
  admob_native_unit_id?: string;
  uploaded_file_id?: string;
  uploaded_file_name?: string;
  uploaded_file_size?: number;
  uploaded_file_url?: string;
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
