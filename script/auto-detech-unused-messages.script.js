const fs = require('fs');

const srcDirectory = 'src';
const allKeys = {};
let allInterpolation = [];

const EXCLUDED_KEYS = [
  'popup_html_filter_type_',
  'popup_html_proposal_funded_option_',
  '_tokens_confirm_text',
  '_tokens_success',
  '_tokens',
  '_tokens_failed',
  'popup_html_notif_pref',
];

function getAllKeys() {
  const directory = 'public/_locales';
  const locales = fs.readdirSync(directory);
  for (const locale of locales) {
    const data = fs.readFileSync(
      `${directory}/${locale}/messages.json`,
      'utf8',
    );
    const parsedJSON = JSON.parse(data);
    const keys = Object.keys(parsedJSON);
    for (const key of keys) {
      allKeys[key] = 0;
    }
  }
}

function checkFile(fileFullPath) {
  const data = fs.readFileSync(fileFullPath, 'utf8');
  findInterpolation(data);
  for (const key of Object.keys(allKeys)) {
    let regexp = new RegExp(`'${key}'|"${key}"|\`${key}\``, 'g');
    let occurence = [...data.matchAll(regexp)].length;
    allKeys[key] = allKeys[key] + occurence;
  }
}

function findInterpolation(data) {
  const regexp = new RegExp(/\`.*\$\{.*\}.*\`/, 'gm');
  const allMatches = data.matchAll(regexp);
  for (const match of allMatches) {
    if (!match[0].includes('@${')) allInterpolation.push(match[0]);
  }
}

function checkDirectory(path) {
  const files = fs.readdirSync(path);
  for (const file of files) {
    const fileFullPath = `${path}/${file}`;
    if (fs.lstatSync(fileFullPath).isDirectory()) {
      checkDirectory(fileFullPath);
    } else {
      const fileExtension = file.split('.')[file.split('.').length - 1];
      if (['tsx', 'ts'].includes(fileExtension)) {
        checkFile(fileFullPath);
      }
    }
  }
}

getAllKeys();
checkDirectory(srcDirectory);

const onlyZeros = Object.keys(allKeys)
  .map((key) => {
    if (
      allKeys[key] === 0 &&
      !EXCLUDED_KEYS.some((ek) => key.startsWith(ek) || key.endsWith(ek))
    )
      return key;
    return null;
  })
  .filter((elem) => !!elem);

console.log(onlyZeros);

console.log(onlyZeros[0]);

console.log(
  `${onlyZeros.length}/${Object.keys(allKeys).length} strings are unused`,
);

// console.log(allInterpolation, allInterpolation.length);
