export enum OverwriteMock {
  SET_AS_NOT_IMPLEMENTED = 'set_as_non_implemented',
}

export enum Tab {
  WITNESS = 0,
  PROXY = 1,
  PROPOSAL = 2,
}

export enum QueryDOM {
  BYLABEL = 'getByLabelText',
  BYTEXT = 'getByText',
}

export enum EventType {
  CLICK = 'click',
  TYPE = 'type',
  HOVER = 'hover',
  UNHOVER = 'unhover',
}

export enum KeyToUse {
  MEMO = 'memo',
  ACTIVE = 'active',
  POSTING = 'posting',
  MASTER = 'master',
}

export enum InputField {
  PRIVATEKEY = 'private_key',
  USERNAME = 'username',
}

export enum KeyMessage {
  MISSING_FIELDS = 'popup_html_fill_form_error',
  NEGATIVE_AMOUNT = 'popup_html_need_positive_amount',
  NOT_ENOUGH_BALANCE = 'popup_html_power_up_down_error',
  RECURRENT_MISSING_FIELDS = 'popup_html_transfer_recurrent_missing_field',
  WARNING_PHISHING = 'popup_warning_phishing',
  CONFIRM_RECURRENT = 'popup_html_transfer_confirm_cancel_recurrent',
  CONFIRM_TRANSFER = 'popup_html_transfer_confirm_text',
  SUCCESS_TRANSFER = 'popup_html_transfer_successful',
  SUCCESS_CANCEL_RECURRENT = 'popup_html_cancel_transfer_recurrent_successful',
  SUCCESS_RECURRENT = 'popup_html_transfer_recurrent_successful',
  FAILED_TRANSFER = 'popup_html_transfer_failed',
  EXCHANGE_WARNING = 'popup_warning_exchange_deposit',
  EXCHANGE_MEMO = 'popup_warning_exchange_memo',
  EXCHANGE_WARNING_RECURRENT = 'popup_html_transfer_recurrent_exchange_warning',
}
