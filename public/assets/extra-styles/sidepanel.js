(function () {
  var FRAME_SELECTOR = '#root .theme';
  var MAX_HEIGHT_SAFETY_OFFSET = 1;
  var TRACKED_MAX_HEIGHT_SELECTORS = [
    {
      selector: '.wallet-item-list',
      variable: '--wallet-history-max-height',
      safetyOffsetPx: 6
    }
  ];

  var updateTrackedMaxHeight = function () {
    var frame = document.querySelector(FRAME_SELECTOR);
    if (!frame) {
      return;
    }

    var isSidepanelPage = document.documentElement.classList.contains(
      'sidepanel-page'
    );
    var frameRect = frame.getBoundingClientRect();
    var frameContentTop = frameRect.top + frame.clientTop;
    var frameContentHeight = frame.clientHeight;

    TRACKED_MAX_HEIGHT_SELECTORS.forEach(function (trackedSelector) {
      var trackedElements = document.querySelectorAll(trackedSelector.selector);
      trackedElements.forEach(function (trackedElement) {
        var trackedElementRect = trackedElement.getBoundingClientRect();
        var trackedSafetyOffset =
          trackedSelector.safetyOffsetPx || MAX_HEIGHT_SAFETY_OFFSET;

        if (!isSidepanelPage) {
          trackedElement.style.removeProperty(trackedSelector.variable);
          return;
        }

        var historyDistanceToFrameTop = Math.max(
          0,
          trackedElementRect.top - frameContentTop
        );
        var historyAvailableMaxHeight = Math.max(
          0,
          Math.floor(
            frameContentHeight -
              historyDistanceToFrameTop -
              trackedSafetyOffset
          )
        );
        trackedElement.style.setProperty(
          trackedSelector.variable,
          historyAvailableMaxHeight + 'px'
        );
      });
    });
  };

  var scheduleTrackedMaxHeightUpdate = function () {
    requestAnimationFrame(updateTrackedMaxHeight);
  };

  window.addEventListener('resize', scheduleTrackedMaxHeightUpdate);
  window.addEventListener('scroll', scheduleTrackedMaxHeightUpdate, true);

  new MutationObserver(scheduleTrackedMaxHeightUpdate).observe(
    document.body,
    {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    }
  );

  if (window.ResizeObserver) {
    var resizeObserver = new ResizeObserver(scheduleTrackedMaxHeightUpdate);
    resizeObserver.observe(document.body);
  }

  document.addEventListener(
    'transitionend',
    function (event) {
      if (!event.target || !event.target.closest) {
        return;
      }
      var shouldRecompute =
        ['height', 'max-height', 'padding', 'margin', 'transform'].indexOf(
          event.propertyName
        ) !== -1;
      if (!shouldRecompute) {
        return;
      }
      if (!event.target.closest('.home-page')) {
        return;
      }
      scheduleTrackedMaxHeightUpdate();
    },
    true
  );

  scheduleTrackedMaxHeightUpdate();
})();
