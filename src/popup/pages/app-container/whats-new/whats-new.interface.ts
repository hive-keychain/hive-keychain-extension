export interface Translation {
  [locale: string]: string;
}

export interface Feature {
  anchor: string;
  image: string;
  title: Translation;
  description: Translation;
  extraInformation: Translation;
}

export interface WhatsNewContent {
  version: string;
  features: Feature[];
}
