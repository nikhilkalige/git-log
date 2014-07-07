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
        }
    }(this);

    var args = ['log', '--decorate=full', '--date=default', '--pretty=fuller', '--all', '--parents', '--numstat', '--topo-order'];
    var options = {};
    options.cwd = atom.project.getRepo();
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
    var log = LogParser(this.log);
    var graph = {};
    graph = new GitGraph(log);
    this.graph.append("p").text("asdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\nasdf\nasdfas\nasdfasd\n");
};
module.exports = GitLogView;
