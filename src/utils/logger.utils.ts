const log = (...message: any[]) => {
  console.log(...message);
};

const info = (message: string) => {
  console.log(`%c ${message} `, 'color: cyan');
};
const warn = (message: string) => {
  console.log(`%c ${message} `, 'color: orange');
  console.warn(`${message}`);
};

const error = (message: any, stacktrace?: string) => {
  console.log(`%c ${message} `, 'color: red');
  // Activate if debug
  // console.error(stacktrace);
};

// function timestamp() {
//     return moment().format('L') + ' ' + moment().format('HH:mm:ss');
// }

const Logger = { log, info, warn, error };

export default Logger;
