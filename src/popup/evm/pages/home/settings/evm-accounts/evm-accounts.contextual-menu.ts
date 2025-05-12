import { ContextualMenu } from '@interfaces/contextual-menu.interface';
import { SVGIcons } from 'src/common-ui/icons.enum';

interface EvmAccountContextualMenuParams {
  activeSeedName: string;
  onEditClicked: Function;
  onDeleteClicked: Function;
  onCreateClicked: Function;
  onImportClicked: Function;
}

export const EvmAccountsContextualMenu = ({
  activeSeedName,
  onEditClicked,
  onDeleteClicked,
  onCreateClicked,
  onImportClicked,
}: EvmAccountContextualMenuParams): ContextualMenu => {
  return {
    sections: [
      {
        title: activeSeedName,
        skipTranslation: true,
        items: [
          {
            icon: SVGIcons.EVM_ACCOUNT_EDIT,
            label: 'evm_edit_seed_nickname',
            onClick: onEditClicked,
          },
          {
            icon: SVGIcons.EVM_ACCOUNT_DELETE,
            label: 'evm_delete_seed_button',
            onClick: onDeleteClicked,
          },
        ],
      },
      {
        title: 'common_seeds',
        items: [
          {
            icon: SVGIcons.EVM_ACCOUNT_ADD,
            label: 'evm_create_seed',
            onClick: onCreateClicked,
          },
          {
            icon: SVGIcons.EVM_ACCOUNT_ADD,
            label: 'evm_import_seed',
            onClick: onImportClicked,
          },
        ],
      },
    ],
  };
};
