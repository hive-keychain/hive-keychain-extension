$("#dialog_header").text(chrome.i18n.getMessage("popup_html_import_keys"));
$("#text_import").html(chrome.i18n.getMessage("import_html_text"));
$("#proceed").text(chrome.i18n.getMessage("popup_html_import"));

$("#proceed").click(async () => {
  const file = $("input").prop("files")[0];
  if (file) {
    const base64 = await toBase64(file);
    const fileData = atob(base64);
    console.log(fileData);
    chrome.runtime.sendMessage({
      command: "importKeys",
      fileData
    });
  }
});
$("#file").on("change", () => {
  $("#file_span").text($("#file").prop("files")[0].name);
});
chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
  if (msg.command == "importResult") {
    $("#import_result").show();
    $("#mod_content").hide();
    if (msg.result) {
      $("#text_finish_import").html(
        chrome.i18n.getMessage("import_html_success")
      );
      $("#dialog_header_result").text(
        chrome.i18n.getMessage("dialog_header_success")
      );
    } else {
      $("#text_finish_import").html(
        chrome.i18n.getMessage("import_html_error")
      );
      $("#dialog_header_result").text(
        chrome.i18n.getMessage("dialog_header_error")
      );
    }
    $("#close").text(chrome.i18n.getMessage("dialog_ok"));
    $("#close").click(() => {
      window.close();
    });
  }
});

const toBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = error => reject(error);
  });
