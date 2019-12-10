const performTransaction = async (data, tab, no_confirm) => {
  let message = null;
  try {
    console.log(data);
    if (data.rpc) rpc.setOptions(data.rpc, true);
    switch (data.type) {
      case "custom":
        message = await broadcastCustomJson(data);
        break;
      case "vote":
        message = await broadcastVote(data);
        break;
      case "transfer":
        message = await broadcastTransfer(data);
        break;
      case "post":
        console.log("post");
        message = await broadcastPost(data);
        break;
      case "addAccountAuthority":
        message = await broadcastAddAccountAuthority(data);
        break;
      case "removeAccountAuthority":
        message = await broadcastRemoveAccountAuthority(data);
        break;
      case "broadcast":
        message = await broadcastData(data);
        break;
      case "createClaimedAccount":
        message = await broadcastCreateClaimedAccount(data);
        break;
      case "signedCall":
        message = await broadcastSignedCall(data);
        break;
      case "delegation":
        message = await broadcastDelegation(data);
        break;
      case "witnessVote":
        message = await broadcastWitnessVote(data);
        break;
      case "powerUp":
        message = await broadcastPowerUp(data);
        break;
      case "powerDown":
        message = await broadcastPowerDown(data);
        break;
      case "sendToken":
        message = await broadcastSendToken(data);
        break;
      case "createProposal":
        message = await broadcastCreateProposal(data);
        break;
      case "updateProposalVote":
        message = await broadcastUpdateProposalVote(data);
        break;
      case "removeProposal":
        message = await broadcastRemoveProposal(data);
        break;
      case "decode":
        message = await decodeMessage(data);
        break;
      case "signBuffer":
        message = await signBuffer(data);
        break;
    }
    chrome.tabs.sendMessage(tab, message);
  } catch (e) {
    console.log("error", e);
    sendErrors(
      tab,
      e,
      "An unknown error has occurred.",
      "An unknown error has occurred.",
      data
    );
  } finally {
    if (no_confirm) {
      if (id_win != null) {
        removeWindow(id_win);
      }
    } else chrome.runtime.sendMessage(message);
    key = null;
    accounts = null;
    rpc.rollback();
  }
};

const createMessage = (err, result, data, success_message, fail_message) => {
  return {
    command: "answerRequest",
    msg: {
      success: !err,
      error: err,
      result: result,
      data: data,
      message: !err ? success_message : fail_message,
      request_id
    }
  };
};

const beautifyErrorMessage = err => {
  if (!err) return null;
  let error = err.message.split("xception:")[1].replace(".rethrow", ".");
  if (error.replace(" ", "") === "") error = "An unknown error has occured.";
  return error;
};
