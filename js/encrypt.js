// AES implementation using cryptojs

var keySize = 256;
var ivSize = 128;
var iterations = 100;

// We add an md5 hash to check if decryption is successful later on.
function encryptJson(json, pwd) {
    json.hash = md5(json.list);
    var msg = encrypt(JSON.stringify(json), pwd);
    return msg;
}

// Decrypt and check the hash to confirm the decryption
function decryptToJson(msg, pwd) {
    try {
        var decrypted = decrypt(msg, pwd).toString(CryptoJS.enc.Utf8);
        decrypted = JSON.parse(decrypted);
        if (decrypted.hash != null && decrypted.hash == md5(decrypted.list))
            return decrypted;
        else {
            console.log("wrong_hash");
            return null;
        }
    } catch (e) {
      console.log("sthwrong");
        return null;
    }
}

// AES encryption with master password
function encrypt(msg, pass) {
    var salt = CryptoJS.lib.WordArray.random(128 / 8);
    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var iv = CryptoJS.lib.WordArray.random(128 / 8);

    var encrypted = CryptoJS.AES.encrypt(msg, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    });
    // salt, iv will be hex 32 in length
    // append them to the ciphertext for use  in decryption
    var transitmessage = salt.toString() + iv.toString() + encrypted.toString();
    return transitmessage;
}

// AES decryption with master password
function decrypt(transitmessage, pass) {
    var salt = CryptoJS.enc.Hex.parse(transitmessage.substr(0, 32));
    var iv = CryptoJS.enc.Hex.parse(transitmessage.substr(32, 32))
    var encrypted = transitmessage.substring(64);

    var key = CryptoJS.PBKDF2(pass, salt, {
        keySize: keySize / 32,
        iterations: iterations
    });

    var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC

    })
    return decrypted;
}
