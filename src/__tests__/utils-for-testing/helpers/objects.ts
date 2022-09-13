/**
 *
 * @param toClone Deep copy of Object or array to clone.
 * Remember to always cast the type after cloning. I.e: const = objects.clone(obj) as REQUIRED_TYPE.
 * Note: This may need extra code if needed to clone nested objects, check on: https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#ejemplos
 */
const clone = (toClone: {} | []): Object | Array<any> => {
  return JSON.parse(JSON.stringify(toClone));
};

export default { clone };
