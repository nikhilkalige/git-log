// git log --decorate=full --date=default --pretty=fuller --all --parents --numstat --topo-order > log.txt
// mv log.txt ~/.atom/packages/git-log/develop


var logparser = require('../lib/logparser.js');
var fs = require('fs');
var _gitgraph = require('./gitgraph.js');
var xmldom = require('xmldom');

function dom_string_lower(ds){
    var cd = {}, //var to backup cdata contents
        i = 0,//key integer to cdata token
        tk = String(new Date().getTime());//cdata to restore
    //backup cdata and attributes, after replace string by tokens
    ds = ds.replace(/\<!\[CDATA\[.*?\]\]\>|[=]["'].*?["']/g, function(a){
        var k = tk + "_" + (++i);
        cd[k] = a;
        return k;
    });
    //to lower xml/html tags
    ds = ds.replace(/\<([^>]|[^=])+([=]| |\>)/g, function(a, b){
        return String(a).toLowerCase();
    });
    //restore cdata contents
    for(var k in cd){
        ds = ds.replace(k, cd[k]);
    }
    cd = null;//Clean variable
    return ds;
}

var d = fs.readFileSync('log.txt', 'utf8');
d = logparser(d);
//console.log(d);
var git_graph = new _gitgraph(d);
var svgGraph = d3.select('svg')
    .attr('xmlns', 'http://www.w3.org/2000/svg');

var svgXML = (new xmldom.XMLSerializer()).serializeToString(svgGraph[0][0]);
var a = dom_string_lower(svgXML);
fs.writeFile('graph.svg', a);
