const formatNotificationOperationLabel = (operation: string) =>
  operation
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export const HiveNotificationOperationLabelUtils = {
  formatNotificationOperationLabel,
};
