const padDatePart = (value: number) => value.toString().padStart(2, '0');

const getKeychainExportFileName = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}-export.kc`;
};

const KeychainExportFileUtils = {
  getKeychainExportFileName,
};

export default KeychainExportFileUtils;
