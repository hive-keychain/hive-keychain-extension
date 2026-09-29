import { scrollTokenDetailPanelContent } from 'src/common-ui/wallet-token-detail-panel/wallet-token-detail-panel.component';

describe('scrollTokenDetailPanelContent', () => {
  it('moves the panel content without leaving its scroll range', () => {
    expect(scrollTokenDetailPanelContent(10, 40, 400, 200)).toBe(50);
    expect(scrollTokenDetailPanelContent(10, -40, 400, 200)).toBe(0);
    expect(scrollTokenDetailPanelContent(180, 40, 400, 200)).toBe(200);
  });
});
