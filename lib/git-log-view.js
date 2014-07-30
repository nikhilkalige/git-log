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

    // hack to get the minimum width of the columns
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

    var style = document.createElement("style");
    this.append(style);
    var sheet = style.sheet;
    var width = this.graph.outerWidth();
    var left = width + 1;
    sheet.addRule(".comments p::before",
        "width:" + width + "px;" +
        "left: -" + left + "px;"
    );
}


GitLogView.prototype.getTitle = function() {
    return "Git-log: " + this.path;
};

GitLogView.prototype.getUri = function() {
    return "git-log://" + this.path;
};

GitLogView.prototype.resize_started = function(event) {
    //console.log("mouse down");
    /*var handlers = function(self) {
        return function() {
            $(document).on('mousemove', self.resize_table);
            $(document).on('mouseup', self.resize_stopped);
        };
    }(this);
*/
    /*this.position = {};
    this.position.pointer_x = event.pageX;
    var left_col = $(event.target);
    var right_col = $(left_col.parents('.column').siblings()[0]);
    this.position.width = {
        left: left_col.width(),
        right: right_col.width()
    };*/

    this.pos={};
    this.pos.pointer_x = event.pageX;
    this.pos.left = $(event.target).position().left;

    this.pos.left_col = $(event.target).parents('.column');
    this.pos.right_col = $(this.pos.left_col.next());

    console.log("do"+ this.pos.left_col.attr('class'));

    this.pos.left_width = this.pos.left_col.width();
    this.pos.right_width = this.pos.right_col.width();

    //handlers();
    $(document).on('mousemove.git-log', this.resize_table);
    $(document).on('mouseup.git-log', this.resize_stopped);
    return false;
};

GitLogView.prototype.resize_table = function(event) {
    //console.log("mouse move");
    /*if(event.which != 1)
        return this.resize_stopped();
    var target =  $(event.target);
    var table_width = target.parents('.table').width();
    var pos_diff = (event.pageX - this.position.pointer_x);
    var new_postion = {
        left: this.position.width.left + pos_diff,
        right: this.position.width.right + pos_diff
    };
    var constrain_width = function() {
        var diff;
        if(new_postion.left < this.min_width) {
            diff = this.min_width - new_postion.left;
            new_postion.left = this.min_width;
            new_postion.right -= diff;
        }
        if(new_postion.right < this.min_width) {
            diff = this.min_width - new_postion.right;
            new_postion.right = this.min_width;
            new_postion.left -= diff;
        }
    };
    //constrain_width();
    var left_col = $(event.target).parents('.column');
    var right_col = $(left_col.siblings()[0]);

    left_col.width(new_postion.left + 'px');
    right_col.width(new_postion.right + 'px');*/
    if(!this.pos)
        return;

    var x = event.pageX - this.pos.pointer_x + this.pos.left;
    this.pos.x = x;

    var inc = this.pos.x - this.pos.left;

    //var left_col = $(event.target).parents('.column');
    //var right_col = $(left_col.siblings()[0]);

    var w = this.pos.left_width + inc;
    var w2 = this.pos.right_width - inc;

    w = Math.max(this.min_width, w);
    w2 = Math.max(this.min_width, w2);

    this.pos.left_col.width(w + 'px');
    this.pos.right_col.width(w2 + 'px');

    this.pos.left_col.css('flex-basis', w + 'px');
    this.pos.right_col.css('flex-basis', w2 + 'px');
    console.log("mo"+ this.pos.left_col.attr('class'));
    return false;

}

GitLogView.prototype.resize_stopped = function(event) {
    /*var handlers = function(self) {
        return function() {
            $(document).off('mousemove', self.resize_table);
            $(document).off('mouseup', self.resize_stopped);
        };
    }(this);
    handlers();*/
    console.log("move up");
    this.pos = null;
    $(document).off('mousemove.git-log', this.resize_table);
    $(document).off('mouseup.git-log', this.resize_stopped);
}

module.exports = GitLogView;
