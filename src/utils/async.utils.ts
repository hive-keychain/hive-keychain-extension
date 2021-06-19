import { LocalStorageKey } from "src/reference-data/local-storage-key.enum";

const getValueFromLocalStorage = async (keys: LocalStorageKey[]): Promise<any> =>  {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(keys, function(result) {
            resolve(result);
        });
    });
}

const AsyncUtils = {
    getValueFromLocalStorage
}



export default AsyncUtils;