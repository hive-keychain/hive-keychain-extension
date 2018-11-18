var signature = require('steem/lib/auth/ecc');
var steem = require('steem');


window.decodeMemo = (e,r) => steem.memo.decode(e,r);
window.encodeMemo = (e,r,a) => steem.memo.encode(e,r,a);
window.signBuffer = (e,r) => signature.Signature.signBuffer(e,r).toHex();
window.signedCall = (m,p,a,k,c) => steem.api.signedCall(m,p,a,k,c);
