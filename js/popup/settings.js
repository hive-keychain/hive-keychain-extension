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
        showConfirm("Your master password was changed succesfully");
      } else showError("Please use a stronger password!");
    } else showError("The new passwords do not match!");
  } else showError("Wrong current password");
});

// Set "remember choice" Preferences
function setPreferences(name) {
  chrome.storage.local.get(["no_confirm"], function(items) {
    try {
      const pref = JSON.parse(items.no_confirm);
      $("#pref").html("");
      if (
        pref[name] == undefined ||
        pref[name] == null ||
        Object.keys(pref[name]).length == 0
      )
        $("#pref").html("No preferences");
      for (let obj in pref[name]) {
        $("#pref").append("<h4>Website: " + obj + "</h4>");
        var display_names = {
          broadcast: "Broadcast",
          addAccountAuthority: "Add Account Authority",
          removeAccountAuthority: "Remove Account Authority",
          custom: "Custom Transaction",
          decode: "Verify Key",
          signBuffer: "Sign",
          signedCall: "Signed Call",
          post: "Post",
          vote: "Vote"
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
