export interface Survey {
  id: number;
  title: string;
  image: string;
  description: string[];
  link: string;
  expirationDate: Date;
}

export interface SurveyInfo {
  lastSurveyIdSeen: number;
}
