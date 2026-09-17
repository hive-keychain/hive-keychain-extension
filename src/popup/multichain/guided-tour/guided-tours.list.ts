import { GuidedTourDefinition } from '@interfaces/guided-tour.interface';
import {
  GuidedTourId,
  GuidedTourTarget,
} from '@reference-data/guided-tour.enum';

export const GUIDED_TOURS: GuidedTourDefinition[] = [
  {
    id: GuidedTourId.ADD_EVM_ACCOUNT,
    isEligible: ({ evmAccountsCount }) => evmAccountsCount === 0,
    steps: [
      {
        target: GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER,
        titleKey: 'popup_html_guided_tour_add_evm_step1_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step1_description',
      },
      {
        target: GuidedTourTarget.ACCOUNT_SELECTOR_CREATE_BUTTON,
        titleKey: 'popup_html_guided_tour_add_evm_step2_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step2_description',
      },
      {
        target: GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM,
        titleKey: 'popup_html_guided_tour_add_evm_step3_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step3_description',
      },
    ],
  },
];
