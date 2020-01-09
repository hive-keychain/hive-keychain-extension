$("title").text(chrome.i18n.getMessage("keychain"));

// Register
$("#register p").html(chrome.i18n.getMessage("popup_html_register"));
$("#master_pwd").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_new_password")
);
$("#confirm_master_pwd").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_confirm")
);
$("#submit_master_pwd").html(chrome.i18n.getMessage("popup_html_submit"));

// Unlock
$("#unlock p").html(chrome.i18n.getMessage("popup_html_unlock"));
$("#unlock_pwd").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_password")
);
$("#submit_unlock").text(chrome.i18n.getMessage("popup_html_signin"));
$("#forgot").text(chrome.i18n.getMessage("popup_html_forgot"));

//Reset
$("#back_forgot").text(chrome.i18n.getMessage("popup_html_reset"));
$("#forgot_div p").text(chrome.i18n.getMessage("popup_html_reset_desc"));
$("#forgot_div button").text(chrome.i18n.getMessage("popup_html_confirm"));

// Main
$("#vm_title").text(chrome.i18n.getMessage("popup_html_vm"));
$("#rc_title").text(chrome.i18n.getMessage("popup_html_rc"));

// Main - actions
$("#send_steem").append(chrome.i18n.getMessage("popup_html_send", ["STEEM"]));
$("#send_sbd").append(chrome.i18n.getMessage("popup_html_send", ["SBD"]));
$("#powerup").append(chrome.i18n.getMessage("popup_html_pu"));
$("#powerdown").append(chrome.i18n.getMessage("popup_html_pd"));
$("#delegate").append(chrome.i18n.getMessage("popup_html_delegate"));

// Main Estimation
$("#account_value_header").text(
  chrome.i18n.getMessage("popup_html_estimation")
);
$("#estimation_info .back_menu").text(
  chrome.i18n.getMessage("popup_html_estimation_info")
);
$("#estimation_info_text").html(
  chrome.i18n.getMessage("popup_html_estimation_info_text")
);

// Main - buttons
$("#send").text(chrome.i18n.getMessage("popup_html_send"));
$("#history").text(chrome.i18n.getMessage("popup_html_history"));
$("#tokens").text(chrome.i18n.getMessage("popup_html_tokens"));
$("#witness").text(chrome.i18n.getMessage("popup_html_witness"));

$("#acc_transfers .back_menu").text(
  chrome.i18n.getMessage("popup_html_wallet_history")
);

// Set up
$("#add_account_div p").html(chrome.i18n.getMessage("popup_html_setup_text"));
$("#add_account_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_setup")
);
$("#username").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_username")
);
$("#pwd").attr("placeholder", chrome.i18n.getMessage("popup_html_private_key"));
$("#check_add_account").text(chrome.i18n.getMessage("popup_html_import_keys"));

// Import keys
$("#import_success").html(chrome.i18n.getMessage("popup_html_import_success"));
$("#import_posting .import_key_title").text(
  chrome.i18n.getMessage("popup_html_posting")
);
$("#import_posting .import_key_info").text(
  chrome.i18n.getMessage("popup_html_posting_info")
);
$("#import_active .import_key_title").text(
  chrome.i18n.getMessage("popup_html_active")
);
$("#import_active .import_key_info").text(
  chrome.i18n.getMessage("popup_html_active_info")
);
$("#import_memo .import_key_title").text(
  chrome.i18n.getMessage("popup_html_memo")
);
$("#import_memo .import_key_info").text(
  chrome.i18n.getMessage("popup_html_memo_info")
);
$("#master_check .back_enabled").text(
  chrome.i18n.getMessage("popup_html_import_keys")
);
$("#save_master").text(chrome.i18n.getMessage("popup_html_save"));

// Settings
$("#settings_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_settings")
);
$("#add_new_account span").text(
  chrome.i18n.getMessage("popup_html_add_account")
);
$("#manage span").text(chrome.i18n.getMessage("popup_html_manage_accounts"));
$("#change_pwd span").text(
  chrome.i18n.getMessage("popup_html_change_password")
);
$("#preferences span").text(chrome.i18n.getMessage("popup_html_pref"));
$("#autolock span").text(chrome.i18n.getMessage("popup_html_autolock"));
$("#keychainify span").text(chrome.i18n.getMessage("popup_html_keychainify"));
$("#about span").text(chrome.i18n.getMessage("popup_html_about"));
$("#clear span").text(chrome.i18n.getMessage("popup_html_clear"));

// Autolock
$("#autolock_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_autolock")
);
$("#div_default .al_title").text(
  chrome.i18n.getMessage("popup_html_al_default_title")
);
$("#div_default .al_info").text(
  chrome.i18n.getMessage("popup_html_al_default_info")
);
$("#div_locked .al_title").text(
  chrome.i18n.getMessage("popup_html_al_locked_title")
);
$("#div_locked .al_info").text(
  chrome.i18n.getMessage("popup_html_al_locked_info")
);
$("#div_idle .al_title").text(
  chrome.i18n.getMessage("popup_html_al_idle_title")
);
$("#div_idle .al_info").text(chrome.i18n.getMessage("popup_html_al_idle_info"));
$("#save_autolock").text(chrome.i18n.getMessage("popup_html_save"));

// Keychainify
$("#keychainify_settings .back_enabled").text(
  chrome.i18n.getMessage("popup_html_keychainify")
);
$("#keychainify_settings p").text(
  chrome.i18n.getMessage("popup_html_keychainify_text")
);
$("#enable_keychainify_title").text(
  chrome.i18n.getMessage("popup_html_enable_keychainify_title")
);
$("#enable_keychainify_info").text(
  chrome.i18n.getMessage("popup_html_enable_keychainify_info")
);

//about
$("#about_div .back_enabled").text(chrome.i18n.getMessage("popup_html_about"));
$(".about-content").html(chrome.i18n.getMessage("popup_html_about_text"));

//manage accounts
$("#manage_keys .back_enabled").text(
  chrome.i18n.getMessage("popup_html_manage_accounts")
);
$(".remove_key").text(
  chrome.i18n.getMessage("popup_html_remove").toUpperCase()
);
$("#posting_key_title").text(
  chrome.i18n.getMessage("popup_html_posting").toUpperCase()
);
$("#active_key_title").text(
  chrome.i18n.getMessage("popup_html_active").toUpperCase()
);
$("#memo_key_title").text(
  chrome.i18n.getMessage("popup_html_memo").toUpperCase()
);
$("#delete_account").text(chrome.i18n.getMessage("popup_html_delete_account"));

//preferences
$("#pref_div .back_enabled").text(chrome.i18n.getMessage("popup_html_pref"));
$("#select_rpc").text(chrome.i18n.getMessage("popup_html_select_rpc"));
$("#notif_pref").text(chrome.i18n.getMessage("popup_html_notif_pref"));
$("#pref_div .info").text(chrome.i18n.getMessage("popup_html_pref_info"));
$("#pref_div #pref").text(chrome.i18n.getMessage("popup_html_no_pref"));
$("#add_rpc_div p").text(chrome.i18n.getMessage("popup_html_add_rpc_text"));
$("#add_rpc_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_add_rpc")
);
$("#new_rpc").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_rpc_node")
);
$("#add_new_rpc").text(chrome.i18n.getMessage("popup_html_add_rpc"));

// Add key
$("#add_key_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_add_key")
);
$("#add_key_div p").html(chrome.i18n.getMessage("popup_html_add_key_text"));
$("#new_key").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_private_key")
);
$("#add_new_key").text(chrome.i18n.getMessage("popup_html_import_key"));
$("#copied div").text(chrome.i18n.getMessage("popup_html_copied"));

// Change Password
$("#change_password .back_enabled").text(
  chrome.i18n.getMessage("popup_html_change_password")
);
$("#change_password p").text(
  chrome.i18n.getMessage("popup_html_change_password_text")
);
$("#old_pwd").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_old_password")
);
$("#new_pwd").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_new_password")
);
$("#confirm_new_pwd").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_confirm")
);
$("#confirm_change_pwd").text(chrome.i18n.getMessage("popup_html_save"));
// transfers
$("#send_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_transfer_funds")
);
$("#balance").text(chrome.i18n.getMessage("popup_html_balance", ["STEEM"]));
$("#loading_balance").text(chrome.i18n.getMessage("popup_html_loading"));
$("#recipient").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_username").toUpperCase()
);
$("#memo_send").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_memo_optional")
);
$(".checkbox_memo div").text(chrome.i18n.getMessage("popup_html_encrypt_memo"));
$("#send_transfer").text(chrome.i18n.getMessage("popup_html_send"));
$("#show_add_active").text(chrome.i18n.getMessage("popup_html_add_active"));
$("#confirm_send_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_transfer")
);
$("#confirm_send_div p").html(
  chrome.i18n.getMessage("popup_html_transfer_confirm_text")
);
$("#confirm_send_div h3")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_transfer_from"));
$("#confirm_send_div h3")
  .eq(1)
  .text(chrome.i18n.getMessage("popup_html_transfer_to"));
$("#confirm_send_div h3")
  .eq(2)
  .text(chrome.i18n.getMessage("popup_html_transfer_amount"));
$("#confirm_send_div h3")
  .eq(3)
  .text(chrome.i18n.getMessage("popup_html_transfer_memo"));
$("#confirm_send_transfer").text(chrome.i18n.getMessage("popup_html_confirm"));
