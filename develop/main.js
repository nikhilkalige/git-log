// git log --decorate=full --date=default --pretty=fuller --all --parents --numstat --topo-order > log.txt
// mv log.txt /home/lonewolf/.atom/packages/git-log/develop


var logparser = require('../lib/logparser.js');
var fs = require('fs');
var _gitgraph = require('./gitgraph.js');

var d = fs.readFileSync('log.txt', 'utf8');
d = logparser(d);
//console.log(logparser(d));
var git_graph = new _gitgraph(d);
