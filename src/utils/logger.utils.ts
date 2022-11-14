/* eslint-disable */

import moment from 'moment';

function log(...message: any[]) {
  console.log(...message);
}

const info = (message: string) => {
  console.log(`%c ${timestamp()} ${message} `, 'color: blue');
};
const warn = (message: string) => {
  console.log(`%c ${timestamp()} ${message} `, 'color: orange');
};

const error = (message: any, stacktrace?: any) => {
  console.log(`%c ${timestamp()} ${message} `, 'color: red');

  if (process.env.DEBUG_LOG && stacktrace) {
    console.log(stacktrace);
  }
};

function timestamp() {
  return `[${moment().format('L') + ' ' + moment().format('HH:mm:ss')}]`;
}

const Logger = { log, info, warn, error };

export default Logger;
