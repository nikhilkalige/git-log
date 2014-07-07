var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");
var d3 = require("d3");

GitLogView.prototype.initialize = function(repo_name) {
    this.path = repo_name;
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
        this.comments.append('<p>' + log.message + '</p>');
        this.commit.append('<p>' + log.sha1.slice(0,7) + '</p>');
        this.date.append('<p>' + log.author_date + '</p>')
        this.author.append('<p>' + log.author_name + ' &lt' + log.author_email + '&gt' + '</p>')
    }
}

module.exports = GitLogView;
