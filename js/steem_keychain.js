// Content script interfacing the website and the extension
var steem_keychain = {
    current_id: 1,
    requests: {},
    handshake_callback: null,

    requestHandshake: function(callback) {
        this.handshake_callback = callback;
        this.dispatchCustomEvent("swHandshake", "");
    },

    requestVerifyKey: function(account, message, key, callback) {
        var request = {
            type: "decode",
            username: account,
            message: message,
            method: key
        };

        this.dispatchCustomEvent("swRequest", request, callback);
    },
    
    signBuffer: function(account, message, key, callback) {
        var request = {
            type: "signBuffer",
            username: account,
            message: message,
            method: key
        };
        
        this.dispatchCustomEvent("swRequest", request, callback);
    },
    
    broadcast: function(account, operations, key, callback) {
        var request = {
            type: "broadcast",
            username: account,
            operations,
            method: key
        };
        
        this.dispatchCustomEvent("swRequest", request, callback);
    },

    // Example comment_options: {"author":"stoodkev","permlink":"hi","max_accepted_payout":"100000.000 SBD","percent_steem_dollars":10000,"allow_votes":true,"allow_curation_rewards":true,"extensions":[[0,{"beneficiaries":[{"account":"yabapmatt","weight":1000},{"account":"steemplus-pay","weight":500}]}]]}
    requestPost: function(account, title, body, parent_perm, parent_account, json_metadata, permlink, comment_options, callback) {
        var request = {
            type: "post",
            username: account,
            title: title,
            body: body,
            parent_perm: parent_perm,
            parent_username: parent_account,
            json_metadata: json_metadata,
            permlink: permlink,
            comment_options: comment_options
        };
        this.dispatchCustomEvent("swRequest", request, callback);
    },

    requestVote: function(account, permlink, author, weight, callback) {
        var request = {
            type: "vote",
            username: account,
            permlink: permlink,
            author: author,
            weight: weight
        };

        this.dispatchCustomEvent("swRequest", request, callback);
    },

    requestCustomJson: function(account, id, key, json, display_msg, callback) {
        var request = {
            type: "custom",
            username: account,
            id: id, //can be "custom", "follow", "reblog" etc.
            method: key, // Posting key is used by default, active can be specified for id=custom .
            json: json, //content of your json
            display_msg: display_msg
        };

        this.dispatchCustomEvent("swRequest", request, callback);
    },
    requestTransfer: function(account, to, amount, memo, currency, callback,enforce=false) {
        var request = {
            type: "transfer",
            username: account,
            to: to,
            amount: amount,
            memo: memo,
            enforce:enforce,
            currency: currency
        };
        this.dispatchCustomEvent("swRequest", request, callback);
    },
    requestDelegation: function(username, delegatee, amount,unit, callback) {
        var request = {
            type: "delegation",
            username: username,
            delegatee: delegatee,
            amount: amount,
            unit:unit
        };
        this.dispatchCustomEvent("swRequest", request, callback);
    },

    // Send the customEvent
    dispatchCustomEvent: function(name, data, callback) {
        this.requests[this.current_id] = callback;
        data = Object.assign({
            request_id: this.current_id
        }, data);
        document.dispatchEvent(new CustomEvent(name, {
            detail: data
        }));
        this.current_id++;
    },

    onGetResponse: function(response) {
        if (response && response.request_id) {
            if (this.requests[response.request_id]) {
                this.requests[response.request_id](response);
                delete this.requests[response.request_id];
            }
        }
    },

    onGetHandshake: function() {
        if (this.handshake_callback)
            this.handshake_callback();
    }
}
