import { addKey } from '@popup/actions/account.actions';
import { goBack } from '@popup/actions/navigation.actions';
import { RootState } from '@popup/store';
import React, { useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import ButtonComponent from 'src/common-ui/button/button.component';
import { InputType } from 'src/common-ui/input/input-type.enum';
import InputComponent from 'src/common-ui/input/input.component';
import { PageTitleComponent } from 'src/common-ui/page-title/page-title.component';
import { KeyType } from 'src/interfaces/keys.interface';
import './add-key.component.scss';

const AddKey = ({ navParams, goBack, addKey }: PropsType) => {
  const [privateKey, setPrivateKey] = useState('');

  const importKey = async () => {
    addKey(privateKey, navParams);
    goBack();
  };

  return (
    <div className="add-key-page">
      <PageTitleComponent
        title="popup_html_add_key"
        isBackButtonEnabled={true}
      />
      <p
        className="introduction"
        dangerouslySetInnerHTML={{
          __html: chrome.i18n.getMessage('popup_html_add_key_text'),
        }}></p>

      <InputComponent
        type={InputType.PASSWORD}
        logo="key"
        placeholder="popup_html_private_key"
        value={privateKey}
        onChange={setPrivateKey}
        onEnterPress={importKey}
      />
      <ButtonComponent label="popup_html_import_key" onClick={importKey} />
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    navParams: state.navigation.params as KeyType,
  };
};

const connector = connect(mapStateToProps, {
  goBack,
  addKey,
});
type PropsType = ConnectedProps<typeof connector>;

export const AddKeyComponent = connector(AddKey);
