import { LocalStorageKeyEnum } from '@reference-data/local-storage-key.enum';
import { BaseApi } from 'src/api/base';
import LocalStorageUtils from 'src/utils/localStorage.utils';

const getMethodFromSignature = async (signature: string) => {
  const savedSignature = await getSavedSignature(signature);

  if (savedSignature) {
    return savedSignature;
  } else {
    const fourByteResponse = await BaseApi.get(
      `https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature.substring(
        2,
        10,
      )}`,
    );
    fourByteResponse.results.sort((a: any, b: any) => {
      return new Date(a.created_at).getTime() < new Date(b.created_at).getTime()
        ? -1
        : 1;
    });

    const textSignature = fourByteResponse.results[0]?.text_signature;
    await addNewSignature(signature, textSignature);
    return textSignature;
  }
};

interface EvmTxInputSignature {
  [signature: string]: { textSignature: string; expiration: number };
}

const getSavedSignature = async (signature: string): Promise<string | null> => {
  let savedSignatures: EvmTxInputSignature = await getSavedSignatures();

  const savedSignature = savedSignatures[signature];
  if (savedSignature && savedSignature.expiration > Date.now()) {
    return savedSignature.textSignature;
  }
  return null;
};

const getSavedSignatures = async () => {
  let savedSignatures: EvmTxInputSignature =
    await LocalStorageUtils.getValueFromLocalStorage(
      LocalStorageKeyEnum.EVM_TX_INPUT_SIGNATURE,
    );

  if (!savedSignatures) return {} as EvmTxInputSignature;
  for (const signature of Object.keys(savedSignatures)) {
    if (savedSignatures[signature].expiration < Date.now()) {
      delete savedSignatures[signature];
    }
  }
  return savedSignatures;
};

const addNewSignature = async (signature: string, textSignature: string) => {
  let savedSignatures: EvmTxInputSignature = await getSavedSignatures();
  savedSignatures[signature] = {
    textSignature: textSignature,
    expiration: Date.now() + Number(process.env.EVM_DATA_EXPIRATION_TIME),
  } as EvmTxInputSignature['signature'];
  await LocalStorageUtils.saveValueInLocalStorage(
    LocalStorageKeyEnum.EVM_TX_INPUT_SIGNATURE,
    savedSignatures,
  );
};

export const EvmDataParser = {
  getMethodFromSignature,
  addNewSignature,
  getSavedSignature,
};
