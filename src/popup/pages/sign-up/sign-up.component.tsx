import { RootState } from "@popup/store";
import { connect, ConnectedProps } from "react-redux";
import React, { useEffect, useState } from "react";
import "./sign-up.component.css";
import { setErrorMessage } from "@popup/actions/error-message.actions";
import { setMk } from "@popup/actions/mk.actions";

const isPasswordValid = (password: string) => {
  return (
    password.length >= 16 ||
    (password.length >= 8 &&
      password.match(/.*[a-z].*/) &&
      password.match(/.*[A-Z].*/) &&
      password.match(/.*[0-9].*/))
  );
};

const SignUp = ({setErrorMessage, setMk}: PropsFromRedux) => {
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const submitMk = (): any =>  {
    if(newPassword === newPasswordConfirm) {
      if(isPasswordValid(newPassword)){
        setMk(newPassword);
      }
      else {
        setErrorMessage("popup_password_regex");
      }
    }
    else {
      setErrorMessage("popup_password_mismatch");
    }

  }
  
    return (
      <div className="sign-up-page">
          <img src="/assets/images/keychain_logo.png" className="logo-white" />
          <p className="introduction" dangerouslySetInnerHTML={{__html: chrome.i18n.getMessage("popup_html_register")}}></p>
          <div className="input-container">
            <input  type="password" placeholder={chrome.i18n.getMessage('popup_html_new_password')} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
            <img src="/assets/images/lock.png" className="input-img" />
          </div>
          <div className="input-container">
            <input  type="password"  placeholder={chrome.i18n.getMessage('popup_html_confirm')}  value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)}/>
            <img src="/assets/images/lock.png" className="input-img" />
          </div>
          <button className="submit-button" onClick={submitMk}>{chrome.i18n.getMessage("popup_html_submit")}</button>
      </div>
    );
  };


  
  const mapStateToProps = (state: RootState) => {
    return {
    };
  };
  
  const connector = connect(mapStateToProps, { setErrorMessage, setMk });
  type PropsFromRedux = ConnectedProps<typeof connector>;
  
  export const SignUpComponent = connector(SignUp);