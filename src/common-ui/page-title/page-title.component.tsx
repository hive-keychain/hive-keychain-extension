import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React from "react";
import "./page-title.component.css";
import { Screen } from "src/reference-data/screen.enum";
import { navigateTo } from "@popup/actions/navigation.actions";

interface PageTitleProps {
    title: string;
    isBackButtonEnabled: boolean;
    backScreen?: Screen,
  }

const PageTitle = ({title, isBackButtonEnabled, backScreen, navigateTo}: PropsType) => {
  
    const handleBackButtonClick = (): void => {
        if(isBackButtonEnabled && backScreen)
            navigateTo(backScreen)
    }

    return (
        <div className="title-section" >
        {isBackButtonEnabled && <button className="icon-button" onClick={handleBackButtonClick}></button>}
        <div className="title">{chrome.i18n.getMessage(title)}</div>
    </div>
    );
  };
  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { navigateTo });
  type PropsType = ConnectedProps<typeof connector> & PageTitleProps;
  
  export const PageTitleComponent = connector(PageTitle);