(function () {
  var FRAME_SELECTOR = '#root .theme';
  var MAX_HEIGHT_SAFETY_OFFSET = 1;
  var TRACKED_BACKGROUND_SELECTORS = [
    {
      selector: '.wallet-background',
      variable: '--wallet-background-max-height'
    },
    {
      selector: '.wallet-item-list',
      variable: '--wallet-history-max-height',
      safetyOffsetPx: 6
    }
  ];

  var updateTrackedBackgroundMaxHeight = function () {
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

    TRACKED_BACKGROUND_SELECTORS.forEach(function (trackedSelector) {
      var trackedElements = document.querySelectorAll(trackedSelector.selector);
      trackedElements.forEach(function (trackedElement) {
        var trackedElementRect = trackedElement.getBoundingClientRect();
        var trackedSafetyOffset =
          trackedSelector.safetyOffsetPx || MAX_HEIGHT_SAFETY_OFFSET;

        if (trackedSelector.selector === '.wallet-background') {
          var walletDistanceToFrameTop = Math.max(
            0,
            trackedElementRect.top - frameContentTop
          );
          var walletMaxHeight = Math.max(
            0,
            Math.floor(
              frameContentHeight -
                walletDistanceToFrameTop -
                trackedSafetyOffset
            )
          );
          trackedElement.style.setProperty(
            trackedSelector.variable,
            walletMaxHeight + 'px'
          );
          return;
        }

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
        var maxHeight = historyAvailableMaxHeight;
        trackedElement.style.setProperty(
          trackedSelector.variable,
          maxHeight + 'px'
        );
      });
    });
  };

  var scheduleTrackedBackgroundMaxHeightUpdate = function () {
    requestAnimationFrame(updateTrackedBackgroundMaxHeight);
  };

  window.addEventListener('resize', scheduleTrackedBackgroundMaxHeightUpdate);

  new MutationObserver(scheduleTrackedBackgroundMaxHeightUpdate).observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  scheduleTrackedBackgroundMaxHeightUpdate();
})();
