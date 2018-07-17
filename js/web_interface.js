document.addEventListener('swHandshake', function(request) {
  location.href="javascript:getHandshake(); void 0";
});

document.addEventListener('swRequest', function(request) {
  chrome.runtime.sendMessage({command:"sendRequest",request:request.detail},function(response){});
});
