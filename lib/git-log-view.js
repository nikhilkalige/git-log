var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");

GitLogView.prototype.initialize = function(repo_name) {
    var settings = atom.config.getSettings();

    this.path = repo_name;
    this.font_size = settings.editor.fontSize * settings['git-log'].fontScale;
    this.line_height = Math.round(this.font_size * settings.editor.lineHeight);
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

  var tags = [];
  var tag_ref = log.refs.filter(function(ref){
    return ref.indexOf('tag:') !== -1;
  });

  if(tag_ref.length !== 0) {
    tags = tag_ref.map(function(tag){
      tag = tag.split(/\//g).pop()
      return '<span class="tag">' + tag + '</span> ';
    })
  }

  var html = "<tr>";
  html += '<td></td>';
  html += '<td><div>' + tags.join('') + log.message + '</div></td>';
  html += '<td><div>' + log.sha1.slice(0,7) + '</div></td>';
  html += '<td><div>' + date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,5) + '</div></td>';
  html += '<td><div>' + log.author_name + ' &lt;' + log.author_email + '&gt;' + '</div></td>';
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

    var column_width = this.find('svg').width() + 40;

    this.find('th').first().width(column_width)
    this.find('.graph-wrapper').first().width(column_width)
}

module.exports = GitLogView;
