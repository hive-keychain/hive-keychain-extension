function onPageLoad() {
  //   let provider = EvmProviderModule.getProvider();

  //   window.ethereum = provider;

  function announceProvider() {
    window.dispatchEvent(
      new CustomEvent('eip6963:announceProvider', {
        detail: Object.freeze({ info, provider }),
      }),
    );
  }

  window.addEventListener('eip6963:requestProvider', (event) => {
    console.log('ici');
    announceProvider();
  });

  announceProvider();
}
console.log('hello evm');
// onPageLoad();
