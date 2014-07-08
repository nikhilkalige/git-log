var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");
var d3 = require("d3");

GitLogView.prototype.initialize = function(repo_name) {
    this.path = repo_name;
    this.line_height = 20;
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
    graph = new GitGraph(this.graph, this.log);
    this.graph.append(graph.svg);
};

GitLogView.prototype.fill_content = function() {
    var i, len;
    for(i=0; len = this.log.length, i < len; i++) {
        var log = this.log[i];
        this.comments.add_content(log.message);
        this.commit.add_content(log.sha1.slice(0,7));

        var date = log.author_date.split(/ /);

        this.date.add_content(date[2] + ' ' + date[1] + ' ' + date[4] + ' ' + date[3].slice(0,5));
        this.author.add_content(log.author_name + ' <' + log.author_email + '>');
    }

   /* var height = this.prop("scrollHeight");
    var width = this.prop("scrollWidth");

    this.underlay.css('height', height);
    this.underlay.css('width', width);*/

    this.css("font-size", 12);
    this.css("line-height", 20);
}

module.exports = GitLogView;
