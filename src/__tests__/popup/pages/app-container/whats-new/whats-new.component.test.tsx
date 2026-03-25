import '@testing-library/jest-dom';
import { act, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import dataTestIdButton from 'src/__tests__/utils-for-testing/data-testid/data-testid-button';
import dataTestIdLink from 'src/__tests__/utils-for-testing/data-testid/data-testid-link';
import initialStates from 'src/__tests__/utils-for-testing/data/initial-states';
import versionLog from 'src/__tests__/utils-for-testing/data/version-log';
import reactTestingLibrary from 'src/__tests__/utils-for-testing/react-testing-library-render/react-testing-library-render-functions';
import { HiveAppComponent } from 'src/popup/hive/hive-app.component';
describe('whats-new.component tests:\n', () => {
  const originalImage = globalThis.Image;
  /**
   * WhatsNew sets `src` before `onload`; real browsers fire onload after both exist.
   * Fire when `onload` is assigned (matches production order in whats-new.component.tsx).
   */
  class ImageWithSyncOnload {
    private _onload: (() => void) | null = null;
    set src(_url: string) {
      queueMicrotask(() => this._onload?.());
    }
    set onload(fn: (() => void) | null) {
      this._onload = fn;
      queueMicrotask(() => this._onload?.());
    }
    get onload() {
      return this._onload;
    }
  }

  afterEach(() => {
    jest.clearAllMocks();
    cleanup();
    globalThis.Image = originalImage;
  });

  describe('Same app versions:\n', () => {
    beforeEach(async () => {
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
        initialStates.iniStateAs.defaultExistent,
      );
    });
    it('Must not show whats new component', () => {
      expect(screen.queryByTestId('whats-new-popup')).not.toBeInTheDocument();
    });
  });
  describe('Different app versions:\n', () => {
    beforeEach(async () => {
      globalThis.Image = ImageWithSyncOnload as unknown as typeof Image;
      await reactTestingLibrary.renderWithConfiguration(
        <HiveAppComponent />,
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

    it('Must open whats new, url link', async () => {
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await userEvent.click(
          screen.getAllByTestId(dataTestIdLink.whatsNew.link.readMore)[0],
        );
      });
      expect(jest.spyOn(chrome.tabs, 'create')).toHaveBeenCalledWith({
        url:
          versionLog.versionLog2_2.url +
          '#' +
          versionLog.versionLog2_2.features.en[0].anchor,
      });
    });

    it('Must close whats new', async () => {
      await act(async () => {
        await Promise.resolve();
      });
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.whatsNew.button.nextPage),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.whatsNew.button.nextPage),
        );
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.whatsNew.button.nextPage),
        );
      });
      await act(async () => {
        await userEvent.click(
          await screen.findByTestId(dataTestIdButton.whatsNew.button.lastPage),
        );
      });
      expect(screen.queryByTestId('whats-new-popup')).not.toBeInTheDocument();
    });
  });
});
