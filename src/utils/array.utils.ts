const mergeWithoutDuplicate = (a: any[], b: any[], key?: string) => {
  var list = [...a, ...b];
  for (var i = 0; i < list.length; ++i) {
    for (var j = i + 1; j < list.length; ++j) {
      if (key) {
        if (list[i][key] === list[j][key]) list.splice(j--, 1);
      } else {
        if (list[i] === list[j]) list.splice(j--, 1);
      }
    }
  }

  return list;
};

const ArrayUtils = {
  mergeWithoutDuplicate,
};

export default ArrayUtils;
