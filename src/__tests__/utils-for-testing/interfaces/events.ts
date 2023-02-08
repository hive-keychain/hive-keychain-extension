import { EventType } from 'src/__tests__/utils-for-testing/enums/enums';

export interface TypeAwait {
  ariaLabel: string;
  text: string;
}
/**
 * ClickOrType, when just need to skip an event, declare ariaLabel & event as 'none'.
 */
export interface ClickOrType {
  ariaLabel: string | 'none';
  event: EventType | 'none';
  text?: string;
}
