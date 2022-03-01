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

const getMaxValue = (list: any[], property?: string) => {
  let max = 0;
  for (const elem of list) {
    if ((property && elem[property] > max) || elem > max) {
      max = property ? elem[property] : elem;
    }
  }
  return max;
};

const getMinValue = (list: any[], property?: string) => {
  let min = Number.MAX_SAFE_INTEGER;
  for (const elem of list) {
    if ((property && elem[property] < min) || elem < min) {
      min = property ? elem[property] : elem;
    }
  }
  return min;
};

const ArrayUtils = {
  mergeWithoutDuplicate,
  getMaxValue,
  getMinValue,
};

export default ArrayUtils;
