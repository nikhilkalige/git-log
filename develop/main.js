// git log --decorate=full --date=default --pretty=fuller --all --parents --numstat --topo-order > log.txt
// mv log.txt /home/lonewolf/.atom/packages/git-log/develop


var logparser = require('../lib/logparser.js');
fs = require('fs');

var d;
d = fs.readFileSync('log.txt', 'utf8');

console.log(logparser(d));
