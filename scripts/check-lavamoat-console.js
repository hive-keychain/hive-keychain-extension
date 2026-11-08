const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const Module = require('module');

const chunks = [];
const originalWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, encoding, callback) => {
  chunks.push(Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk));
  return originalWrite(chunk, encoding, callback);
};

const loggerPath = path.join(__dirname, '../src/utils/logger.utils.ts');
const transpiled = ts.transpileModule(fs.readFileSync(loggerPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    esModuleInterop: true,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;

const loggerModule = new Module(loggerPath);
loggerModule.filename = loggerPath;
loggerModule.paths = Module._nodeModulePaths(path.dirname(loggerPath));
loggerModule._compile(transpiled, loggerPath);
const Logger = loggerModule.exports.default || loggerModule.exports;

require('ses');
const { LOCKDOWN_OPTIONS } = require('../webpack/lavamoat');
globalThis.lockdown(LOCKDOWN_OPTIONS);
Logger.info('lavamoat-logger-marker');

const output = chunks.join('');
const error = new Error('lavamoat-stack-marker');

if (!output.includes('lavamoat-logger-marker')) {
  process.stderr.write('Logger did not reach stdout under SES lockdown\n');
  process.exit(2);
}

if (!String(error.stack).includes('lavamoat-stack-marker')) {
  process.stderr.write(`Error.stack missing under SES lockdown: ${error.stack}\n`);
  process.exit(3);
}
