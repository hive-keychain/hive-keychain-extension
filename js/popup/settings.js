// For accounts settings

// Change master password
$("#confirm_change_pwd").click(function() {
  if (mk === $("#old_pwd").val()) {
    if ($("#new_pwd").val() === $("#confirm_new_pwd").val()) {
      if (
        !$("#new_pwd")
          .val()
          .match(/^(.{0,7}|[^0-9]*|[^A-Z]*|[^a-z]*|[a-zA-Z0-9]*)$/)
      ) {
        mk = $("#new_pwd").val();
        accountsList.save(mk);
        sendMk(mk);
        initializeVisibility();
        showConfirm(chrome.i18n.getMessage("popup_master_changed"));
      } else showError(chrome.i18n.getMessage("popup_pwd_stronger"));
    } else showError(chrome.i18n.getMessage("popup_pwd_match"));
  } else showError(chrome.i18n.getMessage("popup_wrong_current_pwd"));
});

// Set "remember choice" Preferences
function setPreferences(name) {
  chrome.storage.local.get(["no_confirm"], function(items) {
    try {
      const pref = JSON.parse(items.no_confirm);
      $("#pref").html("");
      if (!pref[name] || Object.keys(pref[name]).length == 0)
        $("#pref").html(chrome.i18n.getMessage("popup_html_no_pref"));
      for (let obj in pref[name]) {
        $("#pref").append(
          `<h4>${chrome.i18n.getMessage("popup_website")}: ${obj} </h4>`
        );
        var display_names = {
          broadcast: chrome.i18n.getMessage("popup_broadcast"),
          addAccountAuthority: chrome.i18n.getMessage("popup_add_auth"),
          removeAccountAuthority: chrome.i18n.getMessage("popup_remove_auth"),
          custom: chrome.i18n.getMessage("popup_custom"),
          decode: chrome.i18n.getMessage("popup_decode"),
          signBuffer: chrome.i18n.getMessage("popup_sign_buffer"),
          signedCall: chrome.i18n.getMessage("popup_signed_call"),
          post: chrome.i18n.getMessage("popup_post"),
          vote: chrome.i18n.getMessage("popup_vote")
        };
        var site_container = $(
          '<div class="preferences-site-container"></div>'
        );
        for (let sub in pref[name][obj]) {
          site_container.append(
            "<div><div class='pref_name'>" +
              display_names[sub] +
              "</div><img id='" +
              name +
              "," +
              obj +
              "," +
              sub +
              "' class='deletePref' src='../images/delete.png'/></div>"
          );
        }

        $("#pref").append(site_container);
      }

      $(".deletePref").click(function() {
        const user = $(this)
          .attr("id")
          .split(",")[0];
        const domain = $(this)
          .attr("id")
          .split(",")[1];
        const type = $(this)
          .attr("id")
          .split(",")[2];
        delete pref[user][domain][type];
        if (Object.keys(pref[user][domain]).length == 0)
          delete pref[user][domain];
        chrome.storage.local.set(
          {
            no_confirm: JSON.stringify(pref)
          },
          function() {
            setPreferences(name);
          }
        );
      });
    } catch (e) {}
  });
}
