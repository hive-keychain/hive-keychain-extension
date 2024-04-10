const formatAddress = (address: string) => {
  return address.slice(0, 7) + '...' + address.slice(address.length - 5);
};
const EVMFormatUtils = {
  formatAddress,
};

export default EVMFormatUtils;
