import { GuidedTourDefinition } from '@interfaces/guided-tour.interface';
import {
  GuidedTourId,
  GuidedTourStatus,
  GuidedTourTarget,
} from '@reference-data/guided-tour.enum';
import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { GuidedTourUtils } from 'src/utils/guided-tour.utils';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const addEvmTour: GuidedTourDefinition = {
  id: GuidedTourId.ADD_EVM_ACCOUNT,
  isEligible: ({ hiveAccountsCount, evmAccountsCount }) =>
    hiveAccountsCount > 0 && evmAccountsCount === 0,
  steps: [
    {
      target: GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER,
      titleKey: 'step-1',
      descriptionKey: 'step-1-desc',
    },
    {
      target: GuidedTourTarget.ACCOUNT_SELECTOR_MANAGE_BUTTON,
      titleKey: 'step-2',
      descriptionKey: 'step-2-desc',
      advanceOn: 'next',
    },
    {
      target: GuidedTourTarget.ACCOUNT_SELECTOR_CREATE_BUTTON,
      titleKey: 'step-3',
      descriptionKey: 'step-3-desc',
    },
    {
      target: GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM,
      titleKey: 'step-4',
      descriptionKey: 'step-4-desc',
    },
  ],
};

const addEvmChainsTour: GuidedTourDefinition = {
  id: GuidedTourId.ADD_EVM_CHAINS,
  isEligible: ({ evmAccountsCount, isEvmAccountSelected }) =>
    evmAccountsCount > 0 && isEvmAccountSelected,
  steps: [
    {
      target: GuidedTourTarget.CHAIN_DROPDOWN_TRIGGER,
      titleKey: 'chains-1',
      descriptionKey: 'chains-1-desc',
    },
    {
      target: GuidedTourTarget.CHAIN_DROPDOWN_PANEL,
      titleKey: 'chains-2',
      descriptionKey: 'chains-2-desc',
    },
    {
      target: GuidedTourTarget.CHAIN_SELECTOR,
      titleKey: 'chains-3',
      descriptionKey: 'chains-3-desc',
    },
  ],
};

const hiveOnlyEligibility = {
  hiveAccountsCount: 1,
  evmAccountsCount: 0,
  isEvmAccountSelected: false,
};

const evmSelectedEligibility = {
  hiveAccountsCount: 1,
  evmAccountsCount: 1,
  isEvmAccountSelected: true,
};

describe('guided-tour.utils tests:\n', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
  });

  it('treats completed and dismissed tours as finished', () => {
    expect(
      GuidedTourUtils.isFinished({
        status: GuidedTourStatus.COMPLETED,
        currentStep: 2,
      }),
    ).toBe(true);
    expect(
      GuidedTourUtils.isFinished({
        status: GuidedTourStatus.DISMISSED,
        currentStep: 2,
      }),
    ).toBe(true);
    expect(
      GuidedTourUtils.isFinished({
        status: GuidedTourStatus.IN_PROGRESS,
        currentStep: 1,
      }),
    ).toBe(false);
  });

  it('keeps the further of two progress values for the same tour', () => {
    expect(
      GuidedTourUtils.mergeTourProgress(
        {
          status: GuidedTourStatus.IN_PROGRESS,
          currentStep: 1,
        },
        {
          status: GuidedTourStatus.COMPLETED,
          currentStep: 2,
        },
      ),
    ).toEqual({
      status: GuidedTourStatus.COMPLETED,
      currentStep: 2,
    });
  });

  it('advances one step at a time and completes on the last step', () => {
    expect(GuidedTourUtils.getAdvancedProgress(0, 3)).toEqual({
      status: GuidedTourStatus.IN_PROGRESS,
      currentStep: 1,
    });
    expect(GuidedTourUtils.getAdvancedProgress(1, 3)).toEqual({
      status: GuidedTourStatus.IN_PROGRESS,
      currentStep: 2,
    });
    expect(GuidedTourUtils.getAdvancedProgress(3, 3)).toEqual({
      status: GuidedTourStatus.COMPLETED,
      currentStep: 3,
    });
  });

  it('does not render a later step when earlier progress has not started', () => {
    const presentTargets = new Set<string>([
      GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM,
    ]);

    expect(
      GuidedTourUtils.getRenderableStepIndex(
        addEvmTour.steps,
        0,
        (target) => presentTargets.has(target),
      ),
    ).toBeNull();
  });

  it('renders the next step when navigation already mounted it', () => {
    const presentTargets = new Set<string>([
      GuidedTourTarget.ADD_ACCOUNT_TYPE_EVM,
    ]);

    expect(
      GuidedTourUtils.getRenderableStepIndex(
        addEvmTour.steps,
        2,
        (target) => presentTargets.has(target),
      ),
    ).toBe(3);
  });

  it('falls back to the latest reachable earlier step when the current target is missing', () => {
    const presentTargets = new Set<string>([
      GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER,
    ]);

    expect(
      GuidedTourUtils.getRenderableStepIndex(
        addEvmTour.steps,
        2,
        (target) => presentTargets.has(target),
      ),
    ).toBe(0);
  });

  it('selects the first eligible unfinished tour', () => {
    expect(
      GuidedTourUtils.getActiveTour(
        [addEvmTour, addEvmChainsTour],
        {},
        hiveOnlyEligibility,
      )?.id,
    ).toBe(GuidedTourId.ADD_EVM_ACCOUNT);
    expect(
      GuidedTourUtils.getActiveTour(
        [addEvmTour, addEvmChainsTour],
        {},
        evmSelectedEligibility,
      )?.id,
    ).toBe(GuidedTourId.ADD_EVM_CHAINS);
    expect(
      GuidedTourUtils.getActiveTour(
        [addEvmTour, addEvmChainsTour],
        {},
        {
          hiveAccountsCount: 1,
          evmAccountsCount: 1,
          isEvmAccountSelected: false,
        },
      ),
    ).toBeUndefined();
    expect(
      GuidedTourUtils.getActiveTour(
        [addEvmTour, addEvmChainsTour],
        {},
        {
          hiveAccountsCount: 0,
          evmAccountsCount: 0,
          isEvmAccountSelected: false,
        },
      ),
    ).toBeUndefined();
    expect(
      GuidedTourUtils.getActiveTour(
        [addEvmTour, addEvmChainsTour],
        {
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.COMPLETED,
            currentStep: 3,
          },
        },
        hiveOnlyEligibility,
      ),
    ).toBeUndefined();
    expect(
      GuidedTourUtils.getActiveTour(
        [addEvmTour, addEvmChainsTour],
        {
          [GuidedTourId.ADD_EVM_CHAINS]: {
            status: GuidedTourStatus.DISMISSED,
            currentStep: 2,
          },
        },
        evmSelectedEligibility,
      ),
    ).toBeUndefined();
  });

  it('merges imported tour progress by keeping the furthest state', () => {
    const merged = GuidedTourUtils.mergeProgressMaps(
      {
        [GuidedTourId.ADD_EVM_ACCOUNT]: {
          status: GuidedTourStatus.IN_PROGRESS,
          currentStep: 0,
        },
        local_only: {
          status: GuidedTourStatus.IN_PROGRESS,
          currentStep: 1,
        },
      },
      {
        [GuidedTourId.ADD_EVM_ACCOUNT]: {
          status: GuidedTourStatus.COMPLETED,
          currentStep: 2,
        },
        imported_only: {
          status: GuidedTourStatus.IN_PROGRESS,
          currentStep: 0,
        },
        invalid: { status: 'nope' },
      },
    );

    expect(merged).toEqual({
      [GuidedTourId.ADD_EVM_ACCOUNT]: {
        status: GuidedTourStatus.COMPLETED,
        currentStep: 2,
      },
      local_only: {
        status: GuidedTourStatus.IN_PROGRESS,
        currentStep: 1,
      },
      imported_only: {
        status: GuidedTourStatus.IN_PROGRESS,
        currentStep: 0,
      },
    });
  });

  it('keeps the higher in-progress step when merging the same tour', () => {
    expect(
      GuidedTourUtils.mergeProgressMaps(
        {
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.IN_PROGRESS,
            currentStep: 1,
          },
        },
        {
          [GuidedTourId.ADD_EVM_ACCOUNT]: {
            status: GuidedTourStatus.IN_PROGRESS,
            currentStep: 2,
          },
        },
      ),
    ).toEqual({
      [GuidedTourId.ADD_EVM_ACCOUNT]: {
        status: GuidedTourStatus.IN_PROGRESS,
        currentStep: 2,
      },
    });
  });

  it('places the tooltip below the target when there is room', () => {
    const layout = GuidedTourUtils.getOverlayLayout(
      { top: 40, left: 20, width: 120, height: 50 },
      { width: 350, height: 600 },
      80,
    );

    expect(layout.tooltip.placement).toBe('below');
    expect(layout.hole.top).toBe(40);
    expect(layout.panes.top.height).toBe(40);
    expect(layout.tooltip.top).toBeGreaterThan(layout.hole.top + layout.hole.height);
  });

  it('matches the highlight radius to the target and expands pixel radii with padding', () => {
    expect(GuidedTourUtils.expandBorderRadius('16px', 2)).toBe('18px');
    expect(GuidedTourUtils.expandBorderRadius('16px 8px', 2)).toBe('18px 10px');
    expect(GuidedTourUtils.expandBorderRadius('0px', 2)).toBe('0px');
    expect(GuidedTourUtils.expandBorderRadius('50%', 2)).toBe('50%');

    const layout = GuidedTourUtils.getOverlayLayout(
      { top: 40, left: 20, width: 120, height: 50, borderRadius: '16px' },
      { width: 350, height: 600 },
      80,
    );

    expect(layout.borderRadius).toBe('16px');
  });

  it('places the tooltip above the target when the hole is near the bottom', () => {
    const layout = GuidedTourUtils.getOverlayLayout(
      { top: 520, left: 16, width: 300, height: 48 },
      { width: 350, height: 600 },
      80,
    );

    expect(layout.tooltip.placement).toBe('above');
    expect(layout.tooltip.top).toBeLessThan(layout.hole.top);
  });

  it('loads and saves tour progress from local storage', async () => {
    jest
      .spyOn(LocalStorageUtils, 'getValueFromLocalStorage')
      .mockResolvedValue({
        [GuidedTourId.ADD_EVM_ACCOUNT]: {
          status: GuidedTourStatus.IN_PROGRESS,
          currentStep: 1,
        },
      });
    const saveSpy = jest
      .spyOn(LocalStorageUtils, 'saveValueInLocalStorage')
      .mockResolvedValue(undefined as never);

    await expect(GuidedTourUtils.loadProgressMap()).resolves.toEqual({
      [GuidedTourId.ADD_EVM_ACCOUNT]: {
        status: GuidedTourStatus.IN_PROGRESS,
        currentStep: 1,
      },
    });

    const nextMap = {
      [GuidedTourId.ADD_EVM_ACCOUNT]: {
        status: GuidedTourStatus.DISMISSED,
        currentStep: 2,
      },
    };
    await GuidedTourUtils.saveProgressMap(nextMap);
    expect(saveSpy).toHaveBeenCalledWith(LocalStorageKeyEnum.GUIDED_TOURS, nextMap);
  });

  it('finds marked tour targets in the document', () => {
    const target = document.createElement('button');
    target.setAttribute(
      'data-guided-tour',
      GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER,
    );
    document.body.appendChild(target);

    expect(
      GuidedTourUtils.hasTarget(GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER),
    ).toBe(true);
    expect(
      GuidedTourUtils.getTargetElement(
        GuidedTourTarget.ACCOUNT_SELECTOR_TRIGGER,
      ),
    ).toBe(target);
  });

  it('detects blocking overlays that should hide the tour', () => {
    expect(GuidedTourUtils.hasBlockingOverlay()).toBe(false);
    const popup = document.createElement('div');
    popup.className = 'popup-container';
    document.body.appendChild(popup);
    expect(GuidedTourUtils.hasBlockingOverlay()).toBe(true);
  });
});
