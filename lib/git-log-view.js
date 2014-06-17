var GitLogView = require("./git-log-class");

GitLogView.prototype.initialize = function(repo_name) {
    this.path = repo_name;
}

GitLogView.prototype.getTitle = function() {
    return "Git-log: " + this.path;
};

module.exports = GitLogView;
