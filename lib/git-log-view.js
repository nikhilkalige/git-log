var GitLogView = require("./git-log-class");
var BufferedProcess = require("atom").BufferedProcess;
var LogParser = require("./logparser");
var GitGraph = require("./gitgraph");
var $ = require("atom").$;

var __bind = function(fn, me) {
    return function() {
        return fn.apply(me, arguments);
    };
};

GitLogView.prototype.initialize = function(repo_name) {
    var settings = atom.config.getSettings();

    this.path = repo_name;
    this.font_size = settings.editor.fontSize * settings['git-log'].fontScale;
    this.line_height = Math.round(this.font_size * settings.editor.lineHeight);
    this.get_log();

    this.resize_started = __bind(this.resize_started, this);
    this.resize_table = __bind(this.resize_table, this);
    this.resize_stopped = __bind(this.resize_stopped, this);
}

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
            self.log_callback();
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

GitLogView.prototype.log_callback = function(data) {
    this.parser();

    this.min_width = Math.floor(this.width()/10);

    this.fill_content();
    this.on('mousedown', '.resize-handle', (function(self) {
        return function(e) {
            self.resize_started(e);
        };
    })(this));
};

GitLogView.prototype.parser = function() {
    this.log = LogParser(this.log);
    var graph = new GitGraph(this.graph.list, this.log, this.line_height);
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

    this.css({
        'font-size': this.font_size + 'px',
        'line-height': this.line_height + 'px'
    });

    // create background for the graph column by adding inline style sheet
    var style = document.createElement("style");
    this.append(style);
    var sheet = style.sheet;
    var width = this.graph.outerWidth();
    var left = width + 1;
    sheet.addRule(".comments p::before, .comments p::after",
        "width:" + width + "px;" +
        "left: -" + left + "px;"
    );

    // click handlers for each commit added to parent
    this.table.on("click", "p", (function(self) {
        return function(e) {
            var line_no = $(this).index();
            var commit_data = self.log[line_no];
            console.log(commit_data.sha1);
        };
    })(this));
}

GitLogView.prototype.getTitle = function() {
    return "Git-log: " + this.path;
};

GitLogView.prototype.getUri = function() {
    return "git-log://" + this.path;
};

GitLogView.prototype.resize_started = function(event) {
    this.pos={};
    this.pos.pointer_x = event.pageX;
    this.pos.left = $(event.target).position().left;

    this.pos.left_col = $(event.target).parents('.column');
    this.pos.right_col = $(this.pos.left_col.next());

    this.pos.left_width = this.pos.left_col.width();
    this.pos.right_width = this.pos.right_col.width();

    $(document).on('mousemove.git-log', this.resize_table);
    $(document).on('mouseup.git-log', this.resize_stopped);
    return false;
};

GitLogView.prototype.resize_table = function(event) {
    if(!this.pos)
        return;

    var x = event.pageX - this.pos.pointer_x + this.pos.left;
    this.pos.x = x;

    var inc = this.pos.x - this.pos.left;

    var w = this.pos.left_width + inc;
    var w2 = this.pos.right_width - inc;

    w = Math.max(this.min_width, w);
    w2 = Math.max(this.min_width, w2);

    //this.pos.left_col.width(w + 'px');
    //this.pos.right_col.width(w2 + 'px');

    this.pos.left_col.css('flex-basis', w + 'px');
    this.pos.right_col.css('flex-basis', w2 + 'px');
    return false;
}

GitLogView.prototype.resize_stopped = function(event) {
    this.pos = null;
    $(document).off('mousemove.git-log', this.resize_table);
    $(document).off('mouseup.git-log', this.resize_stopped);
}

module.exports = GitLogView;
