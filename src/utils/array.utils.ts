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

const findCommons = (listA: any[], listB: any[]) => {
  const commons = [];
  for (const item of listA) {
    if (listB.includes(item)) commons.push(item);
  }
  return commons;
};

const includesAll = (arr: any[], values: any[], key?: string) => {
  if (key) {
    return values.every((v) => arr.map((a: any) => a[key]).includes(v.key));
  } else return values.every((v) => arr.includes(v));
};

const getSetDescendantProp = (obj: any, path: string, value: any) => {
  var way = path.replace(/\[/g, '.').replace(/\]/g, '').split('.'),
    last = way.pop();
  way.reduce(function (o, k, i, kk) {
    return (o[k] =
      //@ts-ignore
      o[k] || (isFinite(i + 1 in kk ? kk[i + 1] : last) ? [] : {}));
    //@ts-ignore
  }, obj)[last] = value;
  return obj;
};

export const ArrayUtils = {
  mergeWithoutDuplicate,
  getMaxValue,
  getMinValue,
  findCommons,
  includesAll,
  getSetDescendantProp,
};
