/* eslint-disable */

import moment from 'moment';

const isDebugLogEnabled = () =>
  process.env.DEBUG_LOG === 'true' || process.env.DEBUG_LOG === '1';

function log(...message: any[]) {
  if (isDebugLogEnabled()) {
    console.log(...message);
  }
}

function debug(...message: any[]) {
  if (isDebugLogEnabled()) {
    console.log(...message);
  }
}

const info = (message: string) => {
  console.log(`%c ${timestamp()} ${message} `, 'color: blue');
};
const warn = (message: string) => {
  console.log(`%c ${timestamp()} ${message} `, 'color: orange');
};

const error = (message: any, stacktrace?: any) => {
  console.log(`%c ${timestamp()} ${message} `, 'color: red');

  if (isDebugLogEnabled() && stacktrace) {
    console.trace();
    console.log(stacktrace);
  }
};

function timestamp() {
  return `[${moment().format('L') + ' ' + moment().format('HH:mm:ss')}]`;
}

const Logger = { log, info, warn, error, debug };

export default Logger;
