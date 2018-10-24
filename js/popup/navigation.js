// All functions and events regarding the visibility and navigation

// Visibility state on the main menu
function initializeVisibility() {
    $("#accounts").html("");
    $("#add_account_div").hide();
    $(".error_div").hide();
    $(".success_div").hide();
    $("#master_check").hide();
    $("#autolock_div").hide();
    $("#username").val("");
    $("#pwd").val("");
    $("#acc_transfers").hide();
    $(".error_div").html("");
    $("#posting_key").prop("checked", true);
    $("#active_key").prop("checked", true);
    $("#memo_key").prop("checked", true);
    $(".account_info").hide();
    $(".account_info_content").hide();
    $(".account_info_menu").removeClass("rotate180");
    $("#transfer_to").hide();
    $("#add_key_div").hide();
    $("#estimation_info").hide();
    $("#new_key").val("");
    $("#keys_info").empty();
    $("#balance_steem").html("");
    $("#balance_sbd").html("");
    $("#balance_sp").html("");
    $(".checkbox_memo").hide();
    $("#encrypt_memo").prop("checked",false);
    $("#register").hide();
    $("#unlock").hide();
    $("#send_div").hide();
    $("#settings_div").hide();
    $("#add_account_div .back_enabled").removeClass("back_disabled");
}

// Use "Enter" as confirmation button for unlocking and registration
$('#unlock_pwd').keypress(function(e) {
    if (e.keyCode == 13)
        $('#submit_unlock').click();
});

$('#confirm_master_pwd').keypress(function(e) {
    if (e.keyCode == 13)
        $('#submit_master_pwd').click();
});

// Clicking back after "forgot password"
$("#back_forgot").click(function() {
    $("#forgot_div").hide();
    if ($(this).attr("id") == "back_forgot_settings")
        $("#settings_div").show();
    else
        $("#unlock").show();
});

// Clicking back after "add key"
$("#add_key_div .back_enabled").click(function() {
    $("#add_key_div").hide();
    $("#manage_keys").show();
    $(".error_div").hide();
});

// Clicking back from the preferences menu
$(".back_pref").click(function() {
    $(".settings_child").hide();
    $("#settings_div").show();
    manageKey = false;
    getPref = false;
});

// Show forgot password
$("#forgot").click(function() {
    $("#forgot_div").show();
    $("#unlock").hide();
});

// Show settings
$("#settings").click(function() {
    $("#settings_div").show();
    $("#main").hide();
});

// Show about
$("#about").click(function() {
    $("#about_div").show();
    $("#about_div h3").html(chrome.runtime.getManifest().name + chrome.runtime.getManifest().version);
    $("#settings_div").hide();
});

// Open the mange keys info
$("#manage").click(function() {
    manageKey = true;
    $("#manage_keys").show();
    $("#settings_div").hide();
    manageKeys($(".usernames .select-selected").eq(1).html());
});

// Go back
$(".back_menu").click(function() {
    initializeMainMenu();
});

// Click on the change password option of the settings
$("#change_pwd").click(function() {
    $("#settings_div").hide();
    $("#change_password").show();
});

// Navigate to preferences
$("#preferences").click(async function() {
    $("#pref_div").show();
    $("#settings_div").hide();
    getPref = true;
    setPreferences($(".select-selected").eq(2).html());
});

// After checking master key, go back to Add Account Page
$(".back_add_key").click(function() {
    $("#master_check").hide();
    $("#add_account_div").show();
});

// Go to clear wallet page
$("#clear").click(function() {
    $("#settings_div").hide();
    $("#forgot_div").show();
    $("#back_forgot").attr("id", "back_forgot_settings");
});

// Show add a new key
$('#add_key').click(function() {
    $('#add_key_div').show();
});

// extra info on the estimated account value
$("#account_value_header").click(function() {
    $('#main').hide();
    $("#estimation_info").show();
});

// Navigate to autolock menu
$("#autolock").click(function() {
    $('#settings_div').hide();
    $("#autolock_div").show();
});

// Show transaction window
$("#send").click(function() {
    $("#send_div").show();
    if(active_account.keys.hasOwnProperty("memo")){
      $(".checkbox_memo").show();
    }
    $("#main").hide();
});

// Show transaction history window
$("#history").click(function() {
    $("#acc_transfers").show();
    $("#main").hide();
});

// Toggle witness votes div
$("#witness_toggle").click(function() {
    $("#witness_votes").animate({
        top: ($("#witness_votes").css('top') == '555px') ? 505 : 555
    }, 500);
});

// Show / hide password
$(".input_img_right_eye").click(function() {
    if ($("#unlock_pwd").prop("type") == "password") {
        $("#unlock_pwd").prop("type", "text");
        $(".input_img_right_eye").prop("src", "../images/eye.png");
        $(".input_img_right_eye").height("20.72px");
    } else {
        $("#unlock_pwd").prop("type", "password");
        $(".input_img_right_eye").prop("src", "../images/hide.png");
        $(".input_img_right_eye").height("29.93px");
    }
});

// Handle pages visibility

function showRegister() {
    $("#main").hide();
    $("#register").show();
}

function showUnlock() {
    $("#main").hide();
    $("#unlock").show();
    $("#unlock_pwd").focus();
}

function showLoader() {
    $("#send_loader").show();
    $("#send_transfer").hide();
}

function showAccountInfo(account, that) {
    if (account.keys.hasOwnProperty("active"))
        $("#transfer_to").show();
    $(".account_info").attr("id", "a" + $(that).index());
    $("#account_info_name").html("@" + account.name);
    $("#main").hide();
    $(".account_info").show();
}

$("#add_new_account").click(function() {
    showAddAccount();
});

function showAddAccount() {
    $("#add_account_div").css("display", "block");
    $("#main").css("display", "none");
    $("#settings_div").css("display", "none");
}
