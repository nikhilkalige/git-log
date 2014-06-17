module.exports = {
    activate: function() {
        atom.workspace.registerOpener();
        atom.workspaceView.command("git-log:show", function(event) {
            open_log_window();
        })
    }
};

var open_log_window = function() {
    if((var path = check_repo_validity()) !== null) {
        uri = "git-log://" + path;
        atom.workspace.open(uri);
    }
}

var check_repo_validity = function() {
    var repository = atom.project.getRepo();
    if(repository !== null) {
        return repository.getWorkingDirectory();
    }
    else {
        return null;
    }
}
