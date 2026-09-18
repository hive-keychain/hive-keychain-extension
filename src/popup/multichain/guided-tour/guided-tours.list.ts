import { GuidedTourDefinition } from '@interfaces/guided-tour.interface';
import {
  GuidedTourId,
  GuidedTourTarget,
} from '@reference-data/guided-tour.enum';

export const GUIDED_TOURS: GuidedTourDefinition[] = [
  {
    id: GuidedTourId.ADD_EVM_ACCOUNT,
    isEligible: ({ hiveAccountsCount, evmAccountsCount }) =>
      hiveAccountsCount > 0 && evmAccountsCount === 0,
    steps: [
      {
        target: GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER,
        titleKey: 'popup_html_guided_tour_add_evm_step1_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step1_description',
      },
      {
        target: GuidedTourTarget.ACCOUNT_SELECTOR_MANAGE_BUTTON,
        titleKey: 'popup_html_guided_tour_add_evm_step2_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step2_description',
        advanceOn: 'next',
      },
      {
        target: GuidedTourTarget.ACCOUNT_SELECTOR_CREATE_BUTTON,
        titleKey: 'popup_html_guided_tour_add_evm_step3_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step3_description',
      },
      {
        target: GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM,
        titleKey: 'popup_html_guided_tour_add_evm_step4_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_step4_description',
      },
    ],
  },
  {
    id: GuidedTourId.ADD_EVM_CHAINS,
    isEligible: ({ evmAccountsCount, isEvmAccountSelected }) =>
      evmAccountsCount > 0 && isEvmAccountSelected,
    steps: [
      {
        target: GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER,
        titleKey: 'popup_html_guided_tour_add_evm_chains_step1_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_chains_step1_description',
      },
      {
        target: GuidedTourTarget.CHAIN_DROPDOWN_PANEL,
        titleKey: 'popup_html_guided_tour_add_evm_chains_step2_title',
      },
      {
        target: GuidedTourTarget.CHAIN_SELECTOR,
        titleKey: 'popup_html_guided_tour_add_evm_chains_step3_title',
        descriptionKey: 'popup_html_guided_tour_add_evm_chains_step3_description',
      },
    ],
  },
];
