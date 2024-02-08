const fs = require('fs');

const exec = require('child_process').exec;

exec('npm list --depth=0', (error, stdout, stderr) => {
  const package = JSON.parse(fs.readFileSync(`package.json`, 'utf8'));

  const dependencies = [
    ...Object.keys(package.dependencies),
    ...Object.keys(package.devDependencies),
  ];
  for (const dep of dependencies) {
    console.log(`Checking ${dep}`);
    if (!stdout.includes(dep)) {
      console.log('Missing dependency, please run `npm install`');
      return;
    }
  }
});
