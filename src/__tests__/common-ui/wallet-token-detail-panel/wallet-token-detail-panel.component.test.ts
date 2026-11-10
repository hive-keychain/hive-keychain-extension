import {
  getTokenDetailPanelHeight,
  scrollTokenDetailPanelContent,
} from 'src/common-ui/wallet-token-detail-panel/wallet-token-detail-panel.component';

describe('getTokenDetailPanelHeight', () => {
  it('keeps the panel at its natural height when all content is visible', () => {
    expect(getTokenDetailPanelHeight(400, 300, 300, 800, 0.9)).toBe(400);
  });

  it('grows the panel by the hidden content height before scrolling', () => {
    expect(getTokenDetailPanelHeight(500, 300, 400, 1000, 0.9)).toBe(600);
  });

  it('caps the panel at the surface-specific frame height ratio', () => {
    expect(getTokenDetailPanelHeight(500, 300, 600, 800, 0.75)).toBe(600);
    expect(getTokenDetailPanelHeight(500, 300, 600, 800, 0.9)).toBe(720);
  });
});

describe('scrollTokenDetailPanelContent', () => {
  it('moves the panel content without leaving its scroll range', () => {
    expect(scrollTokenDetailPanelContent(10, 40, 400, 200)).toBe(50);
    expect(scrollTokenDetailPanelContent(10, -40, 400, 200)).toBe(0);
    expect(scrollTokenDetailPanelContent(180, 40, 400, 200)).toBe(200);
  });
});
