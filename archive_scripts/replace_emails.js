const fs = require('fs');
const path = require('path');

const walk = function(dir, done) {
  let results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
            walk(file, function(err, res) {
              results = results.concat(res);
              next();
            });
          } else {
            next();
          }
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};

walk(__dirname, function(err, results) {
  if (err) throw err;
  let changed = 0;
  for (const file of results) {
    if (file.match(/\.(js|jsx|ts|tsx|html|md|json)$/)) {
      let content = fs.readFileSync(file, 'utf8');
      if (content.includes('hello@tyes.com') || content.includes('hello@tyes.com')) {
        let newContent = content.replace(/office@tyes\.app/g, 'hello@tyes.com')
                                .replace(/hello@tyes\.app/g, 'hello@tyes.com');
        fs.writeFileSync(file, newContent);
        console.log('Updated', file);
        changed++;
      }
    }
  }
  console.log('Total files changed:', changed);
});
