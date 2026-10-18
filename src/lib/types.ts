export interface AppDocument {
  $id: string;
  $createdAt: string;
  user_id?: string;
  store_url?: string;
  app_name?: string;
  theme_color?: string;
  icon_id?: string;
  adsense_publisher_id?: string;
  adsense_slot_id?: string;
  adsense_format?: 'auto' | 'fluid' | 'rectangle';
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
