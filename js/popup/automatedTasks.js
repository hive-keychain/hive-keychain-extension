const tasks = new AutomatedTasks();
let taskUsername;

const showAutomatedTasks = async (user, items) => {
  if (items) tasks.init(items);
  taskUsername = user;
  const claimRewards = tasks.getTaskByUser("claimRewards", user);
  const claimAccounts = tasks.getTaskByUser("claimAccounts", user);
  $("#autoclaim_rewards_checkbox")
    .find("input")
    .prop("checked", claimRewards || false);
  $("#autoclaim_accounts_checkbox")
    .find("input")
    .prop("checked", claimAccounts || false);
};

$("#autoclaim_rewards_checkbox").click(() => {
  const newState = !$("#enable_autoclaim_rewards_box").prop("checked");
  $("#enable_autoclaim_rewards_box").prop("checked", newState);
  if (newState) tasks.setTaskForUser("claimRewards", taskUsername, true);
  else tasks.removeTaskForUser("claimRewards", taskUsername);
});

$("#autoclaim_accounts_checkbox").click(() => {
  const newState = !$("#enable_autoclaim_accounts_box").prop("checked");
  $("#enable_autoclaim_accounts_box").prop("checked", newState);
});
