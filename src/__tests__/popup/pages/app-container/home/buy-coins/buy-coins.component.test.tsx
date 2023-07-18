import '@testing-library/jest-dom';
// //TODO to fix
// describe('buy-coins.component tests:\n', () => {
//   const actionButtonIconBuy = ActionButtonList.find(
//     (actionButton) => actionButton.icon === Icons.BUY,
//   )!.icon;
//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.resetModules();
//     cleanup();
//   });
//   beforeEach(async () => {
//     await reactTestingLibrary.renderWithConfiguration(
//       <HiveAppComponent />,
//       initialStates.iniStateAs.defaultExistent,
//     );
//   });

//   it('Must show the buy coins page & list of exchanges for hive', async () => {
//     const BuyCoinListHIVE = BuyCoinsListItem(
//       BuyCoinType.BUY_HIVE,
//       mk.user.one,
//     ).list;
//     await act(async () => {
//       await userEvent.click(
//         await screen.findByTestId(
//           dataTestIdButton.actionBtn.preFix + actionButtonIconBuy,
//         ),
//       );
//     });
//     expect(
//       await screen.findByTestId(`${Screen.BUY_COINS_PAGE}-page`),
//     ).toBeInTheDocument();
//     const linksFound = await screen.findAllByRole('link');
//     for (let i = 0; i < BuyCoinListHIVE.length; i++) {
//       expect(linksFound[i]).toHaveAttribute('href', BuyCoinListHIVE[i].link);
//     }
//   });

//   it('Must show the buy coins page & list of exchanges for HBD', async () => {
//     const BuyCoinListHBD = BuyCoinsListItem(
//       BuyCoinType.BUY_HDB,
//       mk.user.one,
//     ).list;
//     await act(async () => {
//       await userEvent.click(
//         await screen.findByTestId(
//           dataTestIdButton.actionBtn.preFix + actionButtonIconBuy,
//         ),
//       );
//       await userEvent.click(
//         await screen.findByTestId(dataTestIdSwitch.buyCoins.buyCoins),
//       );
//     });
//     expect(
//       await screen.findByTestId(`${Screen.BUY_COINS_PAGE}-page`),
//     ).toBeInTheDocument();
//     const linksFound = await screen.findAllByRole('link');
//     for (let i = 0; i < BuyCoinListHBD.length; i++) {
//       expect(linksFound[i]).toHaveAttribute('href', BuyCoinListHBD[i].link);
//     }
//   });
// });
