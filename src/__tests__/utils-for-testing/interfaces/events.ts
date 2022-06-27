import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';

export interface TypeAwait {
  ariaLabel: string;
  text: string;
}

export interface ClickOrType {
  ariaLabel: string;
  event: EventType;
  text?: string;
}
