const fixPopupOnMacOs = () => {
  if (
    // From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
    window.screenLeft < 0 ||
    window.screenTop < 0 ||
    window.screenLeft > window.screen.width ||
    window.screenTop > window.screen.height
  ) {
    chrome.runtime.getPlatformInfo(function (info) {
      if (info.os === 'mac') {
        const fontFaceSheet = new CSSStyleSheet();
        fontFaceSheet.insertRule(`
              @keyframes redraw {
                0% {
                  opacity: 1;
                }
                100% {
                  opacity: .99;
                }
              }
            `);
        fontFaceSheet.insertRule(`
              html {
                animation: redraw 1s linear infinite;
              }
            `);
        //@ts-ignore
        document.adoptedStyleSheets = [
          //@ts-ignore
          ...document.adoptedStyleSheets,
          fontFaceSheet,
        ];
      }
    });
  }
};

const PopupUtils = {
  fixPopupOnMacOs,
};

export default PopupUtils;
