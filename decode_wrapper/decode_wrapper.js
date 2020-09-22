var signature = require("steem/lib/auth/ecc");
var steem = require("steem");
window.decodeMemo = (e, r) => {
  try {
    return steem.memo.decode(e, r);
  } catch (a) {
    return r;
  }
};
window.encodeMemo = (e, r, a) => {
  try {
    return steem.memo.encode(e, r, a);
  } catch (a) {
    return a;
  }
};
// window.signBuffer = (e, r) => {
//   // try to parse Buffer
//   let buf = e;
//   try {
//     const o = JSON.parse(buf, (k, v) => {
//       if (
//         v !== null &&
//         typeof v === "object" &&
//         "type" in v &&
//         v.type === "Buffer" &&
//         "data" in v &&
//         Array.isArray(v.data)
//       ) {
//         return new Buffer(v.data);
//       }
//       return v;
//     });
//     if (Buffer.isBuffer(o)) {
//       buf = o;
//     }
//   } catch (e) {}
//   return signature.Signature.signBuffer(buf, r).toHex();
// };
// window.signedCall = (m, p, a, k, c) => steem.api.signedCall(m, p, a, k, c);
