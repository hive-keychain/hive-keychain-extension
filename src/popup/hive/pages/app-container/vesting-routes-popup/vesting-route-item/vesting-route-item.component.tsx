import { VestingRoute } from '@interfaces/vesting-routes.interface';
import React from 'react';
import ButtonComponent, {
  ButtonType,
} from 'src/common-ui/button/button.component';

interface Props {
  account: string;
  lastRoutes: VestingRoute[];
  currentRoutes: VestingRoute[];
}

const VestingRouteItem = ({ account, lastRoutes, currentRoutes }: Props) => {
  // const handleSelect = async (
  //   option: string,
  //   lastRoute: VestingRoute | NonExistenVestingRoute,
  //   newRoute: VestingRoute | NonExistenVestingRoute,
  //   acc: string,
  // ) => {
  //   //TODO cleanup
  //   //'default' | 'skipAndSave' | 'revert'
  //   if (option === 'default') return;
  //   if (option === 'skipAndSave') {
  //     const tempLastVestingRoutes =
  //       await VestingRoutesUtils.getLastVestingRoutes();

  //     let foundLast = tempLastVestingRoutes?.find(
  //       (lastRoute) => lastRoute.account === acc,
  //     );
  //     if ((lastRoute as NonExistenVestingRoute).status === 'non existent') {
  //       foundLast!.routes.push(newRoute as VestingRoute);
  //     } else if ((lastRoute as VestingRoute).fromAccount) {
  //       if (foundLast) {
  //         let routesFound = foundLast.routes as VestingRoute[];
  //         const indexFound = routesFound.findIndex(
  //           (item) => item.id === newRoute.id,
  //         );
  //         if (indexFound > -1) {
  //           routesFound[indexFound] = newRoute as VestingRoute;
  //           foundLast.routes = routesFound;
  //         }
  //       }
  //     }

  //     // console.log('about to save: ', { tempLastVestingRoutes }); //TODO remove line

  //     await VestingRoutesUtils.saveLastVestingRoutes(tempLastVestingRoutes!);
  //     //TODO important: ask cedric what to do here? reload the app? set/update the new displayWrong array?
  //   }
  // };

  const renderVestingItemDetails = (
    vestingRoute: VestingRoute,
    alignment: 'alignment-left' | 'alignment-right',
    addToKey?: string,
  ) => {
    return (
      <div
        className={`vesting-item-details-container ${alignment}-${vestingRoute.id}-${addToKey}`}>
        <div className="title">Id: {vestingRoute.id}</div>
        <div className="title">from: {vestingRoute.fromAccount}</div>
        <div className="title">to: {vestingRoute.toAccount}</div>
        <div className="title">percent: {vestingRoute.percent}</div>
        <div className="title">
          autoVest: {vestingRoute.autoVest.toString()}
        </div>
      </div>
    );
  };

  const renderFromList = (last: VestingRoute[], current: VestingRoute[]) => {
    if (current.length) {
      return current.map((curr) => {
        const foundInLast = last.find((l) => l.id === curr.id);
        return (
          <div
            key={`vesting-route-card-item-current-${curr.id}`}
            className="vesting-route-card-item">
            <div className="vesting-item-card-row-container">
              {!foundInLast ? (
                <div className="title small-font">Non Existent</div>
              ) : (
                renderVestingItemDetails(foundInLast, 'alignment-left', 'last')
              )}
              {renderVestingItemDetails(curr, 'alignment-right', 'curr')}
            </div>
          </div>
        );
      });
    } else if (last.length) {
      return last.map((last) => {
        const foundInCurr = current.find((c) => c.id === last.id);
        return (
          <div
            key={`vesting-route-card-item-current-last-${last.id}`}
            className="vesting-route-card-item">
            <div className="vesting-item-card-row-container">
              {renderVestingItemDetails(last, 'alignment-left', 'curr')}
              {!foundInCurr ? (
                <div>Non Existent</div>
              ) : (
                renderVestingItemDetails(foundInCurr, 'alignment-right', 'last')
              )}
            </div>
          </div>
        );
      });
    } else {
      return null;
    }
  };

  const skipAndSave = () => {
    //TODO
  };

  const revert = () => {
    //TODO
  };

  //TODO add to tr
  return (
    <div className={`carousel-item`} key={`${account}-vesting-routes`}>
      <div className="carousel-item-container">
        <div className="title margin-bottom-8px">Account: @{account}</div>
        <div className="vesting-routes-titles-container">
          <div className="title">Old Route</div>
          <div className="title">New Route</div>
        </div>
        <div
          className="vesting-item-list-container"
          key={`${account}-vesting-item-list-container`}>
          {renderFromList(lastRoutes, currentRoutes)}
        </div>
        <div className="vesting-action-buttons-container">
          <ButtonComponent
            //TODO add missing tr
            skipLabelTranslation
            dataTestId="button-revert-vesting-routes"
            type={ButtonType.IMPORTANT}
            label="These Changes are intentional"
            onClick={skipAndSave}
            additionalClass="vesting-action-button small-font"
          />
          <ButtonComponent
            //TODO add missing tr
            skipLabelTranslation
            dataTestId="button-last-page"
            type={ButtonType.IMPORTANT}
            label="Revert All"
            onClick={revert}
            additionalClass="vesting-action-button small-font"
          />
        </div>
      </div>
    </div>
  );
};

export const VestinRouteItemComponent = VestingRouteItem;

//TODO check when needed & remove code bellow
// {lastRoutes.map((lastRoute, index) => {
//   const currentRoute = currentRoutes.find((current) => current.id);
//   return (
//     <div
//       className="vesting-route-card-item"
//       key={`${userVestingRoute.account}-${lastRoute.id}-vesting-route-card`}>
//       <div className="vesting-item-card-row-container">
//         {(lastRoute as NonExistenVestingRoute).status && (
//           <div className="title small-font">
//             {(lastRoute as NonExistenVestingRoute).status}
//           </div>
//         )}
//         {(lastRoute as VestingRoute).fromAccount &&
//           renderVestingItemDetails(
//             lastRoute as VestingRoute,
//             'alignment-left',
//           )}
//         {(newRoute as NonExistenVestingRoute).status && (
//           <div className="title small-font">
//             {(newRoute as NonExistenVestingRoute).status}
//           </div>
//         )}
//         {(newRoute as VestingRoute).fromAccount &&
//           renderVestingItemDetails(
//             newRoute as VestingRoute,
//             'alignment-right',
//           )}
//       </div>
//       {/* <div>
//         {renderActionOptions(
//           lastRoute,
//           newRoute,
//           userVestingRoute.account,
//         )}
//       </div> */}
//     </div>
//   );
// })}
