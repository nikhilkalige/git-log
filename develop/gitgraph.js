d3 = require('./../node_modules/d3');

function GitGraph(data) {
    this.config = this.set_config(20);
    this.set_position(data);
    var svg = this.render(data);
    return svg;
}

GitGraph.prototype.set_config = function(line_height) {
    var config = {};
    var circle_radius_percent = 20;
    var circle_stroke_percent = 8;
    var branch_spacing_percent = 60;
    var line_width_percent = 10;

    var percentage = function(percent) {
        return (line_height * percent)/100;
    }

    config.circle = {};
    config.circle.radius = percentage(circle_radius_percent);
    config.circle.stroke = percentage(circle_stroke_percent);
    config.circle_spacing = line_height;
    config.branch_spacing = percentage(branch_spacing_percent);
    config.line_width = percentage(line_width_percent);
    config.left_margin = line_height / 2;
    config.top_margin = line_height / 2;
    return config;
};

GitGraph.prototype.set_position = function(data) {
    var _i, _len, _col;
    var curr_row, curr_col;
    var branch_flag;
    var branches = [];

    curr_row = curr_col = 0;
    this.branches = [];
    branch_flag = false;

    var branch_search = function(commit) {
        var i, len;
        for(i=0; len = branches.length, i < len; i++) {
            if(commit.parents.indexOf(branches[i].parent) > -1) {
                //branches.splice(i, 1);
                return branches[i].column;
            }
        }
        return false;
    }

    var get_free_column = function() {
        var i, len;
        for(i=0; len = branches.length, i < len; i++) {
            if(branches[i] == null)
                return i;
        }
        return len;
    }

    var update_branch = function(parent, col) {
        branches[col] = parent;
    }

    var create_branch = function(commit) {
        var i, len, index, my_col, par_col;
        var par, sha1;

        if((index = branches.indexOf(commit.sha1)) > -1) {
            my_col = index;
        }
        else {
            my_col = get_free_column();
        }

        for(i=0; len = commit.parents.length, i < len; i++) {
            par = commit.parents[i];

            if((index = branches.indexOf(par)) > -1) {
                branches[index] = null;
                par_col = index;
                update_branch(par, par_col);
            }
            else {
                if(len == 1 || i == 0) {
                    // dont create new branch
                    update_branch(par, my_col);
                }
                else {
                    par_col = get_free_column();
                    update_branch(par, par_col);
                }
            }
        }
        return my_col;
    }

    for(_i=0; _len = data.length, _i < _len; _i++) {
        var commit = data[_i];
        var position = {};

        position.column = create_branch(commit);
        position.row = curr_row++;
        commit.position = position;
   }
}

GitGraph.prototype.render = function(data) {
    var self = this;
    var svg = d3.select("body").append("svg")
                .attr("width", 600)
                .attr("height", 4000);

    var circles = svg.selectAll("circle")
                    .data(data)
                    .enter()
                    .append("circle");

    var circle_attributes = circles
                            .attr("cx", function(d) { return (self.config.left_margin + (d.position.column * self.config.branch_spacing)) })
                            .attr("cy", function(d) { return (self.config.top_margin + (d.position.row * self.config.circle_spacing)) })
                            .attr("r", function(d) { return self.config.circle.radius })
                            .attr("stoke-width", function(d) { return self.config.circle.stroke })
                            .attr("fill", "#aeaeae")
                            .attr("stroke", "#000");
    return svg;
};


module.exports = GitGraph;
