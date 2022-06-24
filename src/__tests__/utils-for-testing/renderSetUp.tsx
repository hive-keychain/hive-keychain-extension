//TODO: delete after modifying all nedded
// import { render as rtlRender } from '@testing-library/react';
// import React, { ReactElement } from 'react';
// import { Provider } from 'react-redux';
// import { getFakeStore } from 'src/__tests__/utils-for-testing/fake-store';
// import { initialEmptyStateStore } from 'src/__tests__/utils-for-testing/initial-states';

// interface Props {
//   children: React.ReactNode;
// }

// const initialReducerState = initialEmptyStateStore;

// const render = (
//   ui: ReactElement,
//   {
//     initialState = initialReducerState,
//     fakeStore = getFakeStore(initialState),
//     ...renderOptions
//   } = {},
// ) => {
//   const Wrapper = ({ children }: Props) => {
//     return <Provider store={fakeStore}>{children}</Provider>;
//   };

//   return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
// };
// export * from '@testing-library/react';
// export { render as customRender };

export {};
