export interface Translation {
  [locale: string]: string;
}

export interface Feature {
  image: string;
  title: Translation;
  description: Translation;
}

export interface WhatsNewContent {
  version: string;
  features: Feature[];
}
