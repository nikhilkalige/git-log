fs = require('fs');

var d;
d = fs.readFileSync('tmp/log.txt', 'utf8');

var authorRegexp = /([^<]+)<([^>]+)>/;
var gitLogHeaders = {
  'Author': function(currentCommmit, author) {
    var capture = authorRegexp.exec(author);
    if (capture) {
      currentCommmit.authorName = capture[1].trim();
      currentCommmit.authorEmail = capture[2].trim();
    } else {
      currentCommmit.authorName = author;
    }
  },
  'Commit': function(currentCommmit, author) {
    var capture = authorRegexp.exec(author);
    if (capture) {
      currentCommmit.committerName = capture[1].trim();
      currentCommmit.committerEmail = capture[2].trim();
    } else {
      currentCommmit.committerName = author;
    }
  },
  'AuthorDate': function(currentCommmit, date) {
    currentCommmit.authorDate = date;
  },
  'CommitDate': function(currentCommmit, date) {
    currentCommmit.commitDate = date;
  },
  'Reflog': function(currentCommmit, data) {
    currentCommmit.reflogName = data.substring(0, data.indexOf(' '));
    var author = data.substring(data.indexOf(' ') + 2, data.length - 1);
    var capture = authorRegexp.exec(author);
    if (capture) {
      currentCommmit.reflogAuthorName = capture[1].trim();
      currentCommmit.reflogAuthorEmail = capture[2].trim();
    } else {
      currentCommmit.reflogAuthorName = author;
    }
  },
};

parseGitLog = function(data) {
    var commits = [];
    var currentCommmit;
    var parseCommitLine = function(row) {
        if (!row.trim()) return;
        currentCommmit = { refs: [], fileLineDiffs: [] };
        var ss = row.split('(');
        var sha1s = ss[0].split(' ').slice(1).filter(function(sha1) { return sha1 && sha1.length; });
        currentCommmit.sha1 = sha1s[0];
        currentCommmit.parents = sha1s.slice(1);
        if (ss[1]) {
            var refs = ss[1].slice(0, ss[1].length - 1);
            currentCommmit.refs = refs.split(', ');
        }
        commits.push(currentCommmit);
        parser = parseHeaderLine;
    }
    var parseHeaderLine = function(row) {
        if (row.trim() == '') {
            parser = parseCommitMessage;
        } else {
            for (var key in gitLogHeaders) {
                if (row.indexOf(key + ': ') == 0) {
                    gitLogHeaders[key](currentCommmit, row.slice((key + ': ').length).trim());
                return;
            }
        }
        }
    }
    var parseCommitMessage = function(row, index) {
        if (/[\d-]+\t[\d-]+\t.+/g.test(rows[index + 1])) {
            parser = parseFileChanges;
            return;
        }
        if (rows[index + 1] && rows[index + 1].indexOf('commit ') == 0) {
            parser = parseCommitLine;
            return;
        }
        if (currentCommmit.message) currentCommmit.message += '\n';
        else currentCommmit.message = '';
        currentCommmit.message += row.trim();
    }
    var parseFileChanges = function(row, index) {
        if (rows.length === index + 1 || rows[index + 1] && rows[index + 1].indexOf('commit ') === 0) {
            var total = [0, 0, 'Total'];
            for (var n = 0; n < currentCommmit.fileLineDiffs.length; n++) {
                var fileLineDiff = currentCommmit.fileLineDiffs[n];
                if (!isNaN(parseInt(fileLineDiff[0], 10))) {
                    total[0] += fileLineDiff[0] = parseInt(fileLineDiff[0], 10);
                }
                if (!isNaN(parseInt(fileLineDiff[1], 10))) {
                    total[1] += fileLineDiff[1] = parseInt(fileLineDiff[1], 10);
                }
            }
            currentCommmit.fileLineDiffs.splice(0,0, total);
            parser = parseCommitLine;
            return;
        }
        currentCommmit.fileLineDiffs.push(row.split('\t'));
    }
    var parser = parseCommitLine;
    var rows = data.split('\n');
    rows.forEach(function(row, index) {
        parser(row, index);
    });

    commits.forEach(function(commit) { commit.message = (typeof commit.message) === 'string' ? commit.message.trim() : ''; });
    return commits;
};

parseGitLog(d);
