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
$("#send_steem").append(chrome.i18n.getMessage("popup_html_send", ["HIVE"]));
$("#send_sbd").append(chrome.i18n.getMessage("popup_html_send", ["HBD"]));
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
$("#send").text(chrome.i18n.getMessage("popup_html_send_transfer"));
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
$("#import_export span").text(
  chrome.i18n.getMessage("popup_html_import_export")
);
$("#automated_ops span").text(
  chrome.i18n.getMessage("popup_html_automated_tasks")
);
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
// Import / Export
$("#import_settings .back_enabled").text(
  chrome.i18n.getMessage("popup_html_import_export")
);
$("#import_settings p").html(
  chrome.i18n.getMessage("popup_html_import_export_text")
);
$("#import_settings button")
  .eq(0)
  .html(chrome.i18n.getMessage("popup_html_import"));
$("#import_settings button")
  .eq(1)
  .html(chrome.i18n.getMessage("popup_html_export"));
$("#import_settings button")
  .eq(2)
  .html(chrome.i18n.getMessage("popup_html_import_permissions"));
$("#import_settings button")
  .eq(3)
  .html(chrome.i18n.getMessage("popup_html_export_permissions"));

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
$("#show_qr").text(chrome.i18n.getMessage("popup_html_show_qr"));

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
$(".recurrent_transfer div").text(
  chrome.i18n.getMessage("dialog_title_recurrent_transfer")
);
$(".recurrent_transfer_checked p").text(
  chrome.i18n.getMessage("popup_html_transfer_rec")
);
$("#send_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_transfer_funds")
);
$(".send_max").text(chrome.i18n.getMessage("popup_html_send_max"));
$("#balance").text(chrome.i18n.getMessage("popup_html_balance", ["HIVE"]));
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
$("#send_transfer").text(chrome.i18n.getMessage("popup_html_send", [""]));
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
$("#confirm_send_div h3")
  .eq(4)
  .text(chrome.i18n.getMessage("popup_html_transfer_confirm_rec"));
$("#confirm_send_transfer").text(chrome.i18n.getMessage("popup_html_confirm"));

//Claim
$(".close_claim").html(chrome.i18n.getMessage("popup_html_not_now"));
$("#redeem_rewards").html(chrome.i18n.getMessage("popup_html_redeem"));

//witnesses
$("#witness_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_witness_title")
);
$("#wit_disclaimer").text(
  chrome.i18n.getMessage("popup_html_witness_disclaimer")
);
$("#votes_remaining").html(
  chrome.i18n.getMessage("popup_html_witness_remaining")
);
$("#voted").text(chrome.i18n.getMessage("popup_html_witness_voted"));
$("#top100").text(chrome.i18n.getMessage("popup_html_witness_top"));
$("#add_wit").text(chrome.i18n.getMessage("popup_html_witness_add"));
$("#add_wit_div p").text(chrome.i18n.getMessage("popup_html_proxy_desc"));
$("#custom_select_wit option[value=Wit]").text(
  chrome.i18n.getMessage("popup_html_witness_vote")
);
$("#custom_select_wit option[value=Proxy]").text(
  chrome.i18n.getMessage("popup_html_chose_proxy")
);
$("#wit-username").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_username")
);
$("#vote_wit").text(chrome.i18n.getMessage("popup_html_submit"));

// transfers tokens
$("#tokens_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_tokens")
);
$("#tokens_settings_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_tokens_available")
);
$("#tokens_settings_div p").html(
  chrome.i18n.getMessage("popup_html_tokens_settings_text")
);
$(".token_left").text(chrome.i18n.getMessage("popup_html_available"));
$("#token_send_div p").html(
  chrome.i18n.getMessage("popup_html_tokens_send_text")
);
$("#send_tok_to").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_recipient").toUpperCase()
);
$("#memo_tok").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_memo_optional")
);
$("#send_tok").text(chrome.i18n.getMessage("popup_html_send", [""]));
$("#confirm_token_send_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_transfer")
);
$("#confirm_token_send_div p").html(
  chrome.i18n.getMessage("popup_html_token_confirm_text")
);
$("#confirm_token_send_div h3")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_transfer_from"));
$("#confirm_token_send_div h3")
  .eq(1)
  .text(chrome.i18n.getMessage("popup_html_transfer_to"));
$("#confirm_token_send_div h3")
  .eq(2)
  .text(chrome.i18n.getMessage("popup_html_transfer_amount"));
$("#confirm_token_send_div h3")
  .eq(3)
  .text(chrome.i18n.getMessage("popup_html_transfer_memo"));
$("#confirm_send_tok").text(chrome.i18n.getMessage("popup_html_confirm"));

// Power Up
$("#powerup_div .back_enabled").text(chrome.i18n.getMessage("popup_html_pu"));
$("#powerup_div .power_left")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_available"));
$("#powerup_div .power_left")
  .eq(1)
  .text(chrome.i18n.getMessage("popup_html_current"));
$("#powerup_div p").text(chrome.i18n.getMessage("popup_html_powerup_text"));
$("#power_up").text(chrome.i18n.getMessage("popup_html_pu"));

//Power Down
$("#powerdown_div .back_enabled").text(chrome.i18n.getMessage("popup_html_pd"));
$("#powerdown_div .power_left")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_current"));
$("#powerdown_div .power_left")
  .eq(1)
  .text(chrome.i18n.getMessage("popup_html_available"));

$("#powerdown_div p").html(chrome.i18n.getMessage("popup_html_powerdown_text"));
$("#powering_down").text(chrome.i18n.getMessage("popup_html_powering_down"));

$("#power_down").text(chrome.i18n.getMessage("popup_html_pd"));

//Delegations
$("#delegation_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_delegations")
);
$("#delegation_div p").text(
  chrome.i18n.getMessage("popup_html_delegations_text")
);
$("#delegation_values .del_left")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_incoming"));
$("#delegation_values .del_left")
  .eq(1)
  .text(chrome.i18n.getMessage("popup_html_outgoing"));
$("#delegation_values .del_left")
  .eq(2)
  .text(chrome.i18n.getMessage("popup_html_available").toUpperCase());
$("#username_del").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_username")
);
$("#send_del").text(chrome.i18n.getMessage("popup_html_delegate_to_user"));

//Outgoing
$("#outgoing_del_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_outgoing", ["HP"])
);
$("#total_outgoing span")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_total_outgoing"));

//Incoming
$("#incoming_del_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_incoming", ["HP"])
);
$("#total_incoming span")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_total_incoming"));

// Edit delegations
$("#edit_del_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_edit_delegations")
);
$("#edit_del_div p").text(
  chrome.i18n.getMessage("popup_html_edit_delegations_text")
);
$("#edit_delegation_values .del_left")
  .eq(0)
  .text(chrome.i18n.getMessage("popup_html_available"));
$("#edit_delegation_values .del_left")
  .eq(1)
  .text(chrome.i18n.getMessage("popup_html_current"));
$("#edit_del").text(chrome.i18n.getMessage("popup_html_save"));
$("#witness_toggle").text(chrome.i18n.getMessage("popup_html_support"));

//add accounts new
$("#add_by_keys").text(chrome.i18n.getMessage("popup_html_add_by_keys"));
$("#add_by_auth").text(chrome.i18n.getMessage("popup_html_add_by_auth"));
$("#add_import_keys").text(chrome.i18n.getMessage("popup_html_import_keys"));

$("#add_account_types_div p").html(
  chrome.i18n.getMessage("popup_html_chose_add_method")
);
$("#add_account_types_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_setup")
);

//add by auth
$("#authorized_acc_auth").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_auth_placeholder_username_auth")
);
$("#username_auth").attr(
  "placeholder",
  chrome.i18n.getMessage("popup_html_auth_placeholder_username")
);
$("#add_auth_account_div p").html(
  chrome.i18n.getMessage("popup_html_auth_text")
);
$("#add_auth_account_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_setup")
);
$("#add_auth_account_div button").text(
  chrome.i18n.getMessage("popup_html_save")
);

// convert
$("#convert_hive").append(chrome.i18n.getMessage("popup_html_convert_hive"));
$("#convert_hive_div .back_enabled").append(
  chrome.i18n.getMessage("popup_html_convert_hive")
);
$("#convert_hive_div p").text(
  chrome.i18n.getMessage("popup_html_convert_hive_intro")
);
$("#convert_hive_div button").text(
  chrome.i18n.getMessage("popup_html_convert_button")
);
$("#amt_convert_max_hive").text(
  chrome.i18n.getMessage("popup_html_convert_max")
);

$("#convert_hbd ").append(chrome.i18n.getMessage("popup_html_convert_hbd"));
$("#convert_div .back_enabled").append(
  chrome.i18n.getMessage("popup_html_convert_hbd")
);
$("#convert_div p").text(
  chrome.i18n.getMessage("popup_html_convert_hbd_intro")
);
$("#convert_div button").text(
  chrome.i18n.getMessage("popup_html_convert_button")
);
$("#amt_convert_max").text(chrome.i18n.getMessage("popup_html_convert_max"));

// buy
$("#buy_hive ").append(chrome.i18n.getMessage("popup_html_buy_hive"));
$("#buy_hbd ").append(chrome.i18n.getMessage("popup_html_buy_hbd"));

$("#buy_moonpay h2").text(
  chrome.i18n.getMessage("popup_html_buy_moonpay_title")
);
$("#buy_swap h2").text(chrome.i18n.getMessage("popup_html_buy_swap_title"));
$("#buy_exchanges h2").text(
  chrome.i18n.getMessage("popup_html_buy_exchanges_title")
);

// Automated tasks
$("#automated_ops_div .back_enabled").text(
  chrome.i18n.getMessage("popup_html_automated_tasks")
);

$("#automated_ops_div p").text(
  chrome.i18n.getMessage("popup_html_automated_intro")
);
$("#enable_autoclaim_rewards").text(
  chrome.i18n.getMessage("popup_html_enable_autoclaim_rewards")
);
$("#enable_autoclaim_rewards_info").text(
  chrome.i18n.getMessage("popup_html_enable_autoclaim_rewards_info")
);
$("#enable_autoclaim_accounts").text(
  chrome.i18n.getMessage("popup_html_enable_autoclaim_accounts")
);
$("#enable_autoclaim_accounts_info").text(
  chrome.i18n.getMessage("popup_html_enable_autoclaim_accounts_info")
);
$("#proposal_vote p").text(
  chrome.i18n.getMessage("popup_html_proposal_request")
);
