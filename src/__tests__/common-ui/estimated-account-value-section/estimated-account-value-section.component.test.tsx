import { AccountValueType } from '@reference-data/account-value-type.enum';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { EstimatedAccountValueSectionComponent } from 'src/common-ui/estimated-account-value-section/estimated-account-value-section.component';

describe('EstimatedAccountValueSectionComponent', () => {
  it('uses the provided portfolio navigation callback', () => {
    const onPortfolioClick = jest.fn();
    const { container } = render(
      <EstimatedAccountValueSectionComponent
        hasPortofolio
        onPortfolioClick={onPortfolioClick}
        accountValues={{
          [AccountValueType.DOLLARS]: '$1',
          [AccountValueType.TOKEN]: '1 HIVE',
        }}
      />,
    );

    fireEvent.click(container.querySelector('.portfolio-icon')!);

    expect(onPortfolioClick).toHaveBeenCalled();
    expect(chrome.tabs.create).not.toHaveBeenCalled();
  });
});
