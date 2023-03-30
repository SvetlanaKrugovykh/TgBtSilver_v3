const fs = require('fs');

const fname = () => {
  return '..\logs\\' + Date.now.toISOString();
};

fs.readFile(fname, (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(data.toString());
});

fs.writeFile(fname, 'username=Max', err => {
  if (err) {
    console.log(err);
  } else {
    console.log('Wrote to file!');
  }
});
