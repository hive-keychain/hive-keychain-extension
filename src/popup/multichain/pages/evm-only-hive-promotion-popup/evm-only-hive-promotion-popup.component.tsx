import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

interface EvmOnlyHivePromotionPopupProps {
  onCreateHiveAccount: () => void;
  onMaybeLater: () => void;
  onDontShowAgain: () => void;
}

export const EvmOnlyHivePromotionPopupComponent = ({
  onCreateHiveAccount,
  onMaybeLater,
  onDontShowAgain,
}: EvmOnlyHivePromotionPopupProps) => {
  return (
    <div
      className="evm-only-hive-promotion-popup"
      data-testid="evm-only-hive-promotion-popup">
      <img
        className="evm-only-hive-promotion-popup__image"
        src="/assets/images/discover-hive-cta.png"
        alt="Discover Hive ecosystem"
      />
      <div className="evm-only-hive-promotion-popup__title">
        Discover Hive with Keychain
      </div>
      <p className="evm-only-hive-promotion-popup__body">
        You already use Keychain for EVM. Hive gives you fast feeless
        transactions, social apps, games, and account-based identity.
      </p>
      <div className="evm-only-hive-promotion-popup__actions">
        <ButtonComponent
          dataTestId="evm-only-hive-promotion-create-account"
          label="Create Hive account"
          skipLabelTranslation
          onClick={onCreateHiveAccount}
        />
        <ButtonComponent
          dataTestId="evm-only-hive-promotion-maybe-later"
          label="Maybe later"
          skipLabelTranslation
          type={ButtonType.ALTERNATIVE}
          onClick={onMaybeLater}
        />
        <button
          type="button"
          className="evm-only-hive-promotion-popup__dismiss-link"
          data-testid="evm-only-hive-promotion-dont-show-again"
          onClick={onDontShowAgain}>
          Don’t show again
        </button>
      </div>
    </div>
  );
};
