chrome.runtime.onMessage.addListener(function(msg, sender, sendResp) {
    if (msg.command == "sendDialogError") {
        // Display error window

        if (!msg.msg.success) {

            if (msg.msg.error == "locked") {
                $(".unlock").show();
                $("#error-ok").hide();
                $("#no-unlock").click(function() {
                    chrome.tabs.sendMessage(msg.tab, {
                        command: "answerRequest",
                        msg: {
                            success: false,
                            error: "locked",
                            result: null,
                            data: msg.msg.data,
                            message: "The wallet is locked!"
                        }
                    });
                    window.close();
                });
                $("#yes-unlock").click(function() {
                    chrome.runtime.sendMessage({
                        command: "unlockFromDialog",
                        data: msg.msg.data,
                        tab: msg.tab,
                        mk: $("#unlock-dialog").val(),
                        domain: msg.domain
                    });
                });
                $('#unlock-dialog').keypress(function(e) {
                    if (e.keyCode == 13)
                        $('#yes-unlock').click();
                });
                $('#unlock-dialog').focus();
            }
            $("#dialog_header").html("Error");
            $("#dialog_header").addClass("error_header");
            $("#error_dialog").html(msg.msg.message);
            $("#modal-body-msg button").hide();
            $("#error-ok").click(function() {
                window.close();
            });
        }
    } else if (msg.command == "wrongMk") {
        $("#error-mk").html("Wrong password!");
    } else if (msg.command == "sendDialogConfirm") {
        // Display confirmation window
        $("#confirm_footer").show();
        var type = msg.data.type;
        var title = type == "custom" ? "custom JSON" : msg.data.type;
        title = title.charAt(0).toUpperCase() + title.slice(1);
        $("#dialog_header").html(title);
        var message = "";
        $("." + type).show();
        $(".modal-body-error").hide();
        $("#username").html("@" + msg.data.username);
        $("#modal-content").css("align-items", "flex-start");
        if (type != "transfer") {
            $("#keep_div").show();
            $("#keep_label").html("Do not ask again for @" + msg.data.username + "'s " + msg.data.type + " authorization on " + msg.domain);
        }
        switch (type) {
            case "decode":
                $("#wif").html(msg.data.method);
                break;
            case "vote":
                $("#weight").html(msg.data.weight / 100 + " %");
                $("#author").html(msg.data.author);
                $("#perm").html(msg.data.permlink);
                break;
            case "custom":
                $("#custom_json").html(msg.data.json);
                $("#custom_type").html(msg.data.id);
                $("#custom_key").html(msg.data.method);
                break;
            case "transfer":
                $("#to").html(msg.data.to);
                $("#amount").html(msg.data.amount + " " + msg.data.currency);
                $("#memo").html(msg.data.memo);
                if (msg.data.memo.length > 0)
                    $(".transfer_memo").show();
                break;
            case "post":
                $("#title").html(msg.data.title);
                $("#permlink").html(msg.data.permlink);
                $("#body").html(msg.data.body);
                $("#json_metadata").html(msg.data.json_metadata);
                $("#parent_url").html(msg.data.parent_perm);
                $("#parent_username").html(msg.data.parent_username);
                if (msg.data.parent_username == null || msg.data.parent_username == undefined)
                    $("#parent_username").hide();
                break;
        }

        // Closes the window and launch the transaction in background
        $("#proceed").click(function() {
            chrome.runtime.sendMessage({
                command: "acceptTransaction",
                data: msg.data,
                tab: msg.tab,
                domain: msg.domain,
                keep: $("#keep").is(':checked')
            });
            window.close();
        });

        // Closes the window and notify the content script (and then the website) that the user refused the transaction.
        $("#cancel").click(function() {
            chrome.tabs.sendMessage(msg.tab, {
                command: "answerRequest",
                msg: {
                    success: false,
                    error: "user_cancel",
                    result: null,
                    data: msg.data,
                    message: "Request canceled by user!"
                }
            });
            window.close();
        });
    }
});
