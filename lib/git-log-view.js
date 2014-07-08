var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");

GitLogView.prototype.initialize = function(repo_name) {
    this.path = repo_name;
    this.font_size = atom.config.getSettings().editor.fontSize;
    this.line_height = Math.round(this.font_size * atom.config.getSettings().editor.lineHeight);
    this.get_log();
}

GitLogView.prototype.getTitle = function() {
    return "Git-log: " + this.path;
};

GitLogView.prototype.get_log = function() {
    this.log = null;
    var concat = function(self) {
        return function(data) {
            if(self.log == null) {
                self.log = "";
            }
            self.log += data;
        }
    }(this);

    var display_log = function(self) {
        return function(data) {
            self.parser();
            self.fill_content();
        }
    }(this);

    var args = ['log', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order'];
    var options = {};
    options.cwd = atom.project.getRepo().getWorkingDirectory();
    return new BufferedProcess({
        command: 'git',
        args: args,
        options: options,
        stdout: concat,
        stderr: function(data) {console.log(data.toString())},
        exit: display_log
    });
};

GitLogView.prototype.parser = function() {
    this.log = LogParser(this.log);
    var graph = {};
    graph = new GitGraph(this.graph, this.log, this.line_height);
};

var create_row = function(log) {
  var date = log.author_date.split(/ /);

  var html = "<tr>";
  html += '<td></td>';
  html += '<td>' + log.message + '</td>';
  html += '<td>' + log.sha1.slice(0,7) + '</td>';
  html += '<td>' + date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,5) + '</td>';
  html += '<td>' + log.author_name + ' &lt;' + log.author_email + '&gt;' + '</td>';
  html += "</tr>";

  return html;
}

GitLogView.prototype.fill_content = function() {
    var i, len;
    for(i=0; len = this.log.length, i < len; i++) {
        var log = this.log[i];
        this.table_body.append(create_row(log));
    }

    this.css({
        'font-size': this.font_size + 'px',
        'line-height': this.line_height + 'px'
    });

    this.find(".background").css('background-size','40px ' + this.line_height * 2 + 'px');
}

module.exports = GitLogView;
