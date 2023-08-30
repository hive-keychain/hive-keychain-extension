import App from '@popup/App';
import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdLink from 'src/__tests__/utils-for-testing/data-testid/data-testid-link';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import versionLog from 'src/__tests__/utils-for-testing/data/version-log';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
describe('whats-new.component tests:\n', () => {
  /////////////
  //Reset Global Image object after tests done.
  const originalImage = globalThis.Image;
  afterAll(() => {
    globalThis.Image = originalImage;
  });
  /////////////

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
  });

  describe('Same app versions:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
      );
    });
    it('Must not show whats new component', () => {
      expect(screen.queryByTestId('whats-new-popup')).not.toBeInTheDocument();
    });
  });
  describe('Different app versions:\n', () => {
    ////Manipulate Image prototype onload function////
    let imageOnloadCallBack: () => {} | null;
    /**
     * Notes: Add methods as needed.
     * imageOnloadCallBack must be defined on outside scope and invoked within the case.
     * imageOnloadCallBack needs be wrapped in act as it will affect the renders, note that sometimes you will need to await to mbeing able to make assertions.
     * the function itself must be defined before render and called using beforeAll.
     * Important: ALWAYS remember restore the object using Reset Global Image code block as above.
     */
    const addOnLoadOnImage = () => {
      Object.defineProperty(Image.prototype, 'onload', {
        get: function () {
          return this._onload;
        },
        set: function (fn) {
          imageOnloadCallBack = fn;
          this._onload = fn;
        },
      });
    };
    beforeAll(() => {
      addOnLoadOnImage();
    });
    ////////
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <App />,
        initialStates.iniStateAs.defaultExistent,
        {
          app: {
            apiRelated: {
              KeychainApi: {
                customData: {
                  extensionVersion: versionLog.versionLog2_2,
                },
              },
            },
            popupsRelated: {
              whatsnew: {
                chrome: {
                  runtime: {
                    getManifest: {
                      version: '2.2.0',
                      name: 'KeyChain Extension',
                    },
                  },
                },
              },
            },
            localStorageRelated: {
              customData: {
                customlastVersionSeen: '3.1',
              },
            },
          },
        },
      );
    });
    it('Must show whats new component', async () => {
      act(() => {
        imageOnloadCallBack();
      });
      expect(await screen.findByTestId('whats-new-popup')).toBeInTheDocument();
    });

    it('Must open whats new, url link', async () => {
      act(() => {
        imageOnloadCallBack();
      });
      await act(async () => {
        await userEvent.click(
          screen.getAllByTestId(dataTestIdLink.whatsNew.link.readMore)[0],
        );
      });
      expect(jest.spyOn(chrome.tabs, 'create')).toBeCalledWith({
        url:
          versionLog.versionLog2_2.url +
          '#' +
          versionLog.versionLog2_2.features.en[0].anchor,
      });
    });

    it('Must close whats new', async () => {
      act(() => {
        imageOnloadCallBack();
      });
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.whatsNew.button.nextPage),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.whatsNew.button.nextPage),
        );
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.whatsNew.button.nextPage),
        );
      });
      await act(async () => {
        await userEvent.click(
          screen.getByTestId(dataTestIdButton.whatsNew.button.lastPage),
        );
      });
      expect(screen.queryByTestId('whats-new-popup')).not.toBeInTheDocument();
    });
  });
});
