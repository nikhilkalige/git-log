//var d3 = require('d3');


var is_empty = function(obj) {
    if (obj == null) return true;
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }
    return true;
};

function GitGraph(location, data, line_height, margin) {
    this.config = this.set_config(line_height, margin);
    this.set_position(data);
    var svg = this.render(location, data);
}

GitGraph.prototype.set_config = function(line_height, margin) {
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
    config.circle_spacing = line_height + margin;
    config.branch_spacing = percentage(branch_spacing_percent);
    config.line_width = percentage(line_width_percent);
    config.left_margin = line_height / 2;
    config.top_margin = line_height / 2;
    config.cross_height = 40/100;
    /*config.color_list = [
        "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896",
        "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7",
        "#bcbd22", "#dbdb8d","#17becf", "#9edae5"
    ];
    config.color_list = [
        "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939", "#8ca252", "#b5cf6b", "#cedb9c",
        "#8c6d31", "#bd9e39", "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#e7969c",
        "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
    ];
    config.color_list = [
        "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#e6550d", "#fd8d3c", "#fdae6b", "#fdd0a2",
        "#31a354", "#74c476", "#a1d99b", "#c7e9c0", "#756bb1", "#9e9ac8", "#bcbddc", "#dadaeb",
        "#636363", "#969696", "#bdbdbd", "#d9d9d9"
    ];*/
    config.color_list = [
        "#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f",
        "#bcbd22", "#17becf"
    ];
    return config;
};

GitGraph.prototype.set_position = function(data) {
    var _i, _len;
    var curr_row, curr_col;
    var branches = [];
    this.max_level = 0;

    curr_row = curr_col = 0;

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
        while((index = branches.indexOf(commit.sha1)) > -1) {
            branches[index] = null;
        }

        for(i=0; len = commit.parents.length, i < len; i++) {
            par = commit.parents[i];

            if((index = branches.indexOf(par)) > -1) {
                if((branches[my_col] == null))
                    update_branch(par, my_col);
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
        if(position.column > this.max_level)
            this.max_column = position.column;
        position.row = curr_row++;
        commit.position = position;
   }
   this.max_row = curr_row;
}

GitGraph.prototype.commit_search = function(data, commit) {
    var i, len;
    for(i=0; len = data.length, i < len; i++) {
        if(data[i].sha1 === commit)
            return i;
    }
};

GitGraph.prototype.lines = function(data) {
    var create_mid_point = function(start, end, height) {
        var point = {};
        if(start.x == end.x) {
            return false;
        }
        else if(start.x < end.x) {
            point.x = end.x;
            point.y = start.y + height;
        }
        else {
            point.x = start.x;
            point.y = end.y - height;
        }
        return point;
    };

    var i, len;
    var height = this.config.cross_height;
    var colors = this.config.color_list;
    var line_array = [];
    var line_color = [];
    for(i=0; len = data.length, i < len; i++) {
        var commit, j, _len;
        commit = data[i];
        // assign color for commit
        if(line_color[commit.position.column] == null) {
            clr = colors.shift();
            colors.push(clr);
            line_color[commit.position.column] = clr;
        }
        else {
            clr = line_color[commit.position.column];
        }
        commit.position.color = clr;

        for(j=0; _len = commit.parents.length, j < _len; j++) {
            var line = [];
            var start, mid, end, clr;
            start={}; mid={}; end={};

            var index = this.commit_search(data, commit.parents[j]);
            var parent = data[index];

            start.x = commit.position.column;
            start.y = commit.position.row;
            end.x = parent.position.column;
            end.y = parent.position.row;

            if(start.x < end.x) {

                mid.x = end.x;
                mid.y = start.y + height;
                clr = colors.shift();
                colors.push(clr);

                line_color[end.x] = clr;
            }
            else if(start.x > end.x) {
                mid.x = start.x;
                mid.y = end.y - height;
                line_color[start.x] = null;
            }
            start.color = clr;
            line.push(start);
            if(is_empty(mid) == false)
                line.push(mid);
            line.push(end);
            line_array.push(line);
        }
    }
    return line_array;
};

GitGraph.prototype.render = function(location, data) {
    var line_array = this.lines(data);
    var self = this;

    var create_line = function(d) {
        var x, y, point_no;
        var line;
        point_no = 1;
        for(var i=0; len = d.length, i < len; i++) {
            x = self.config.left_margin + (d[i].x * self.config.branch_spacing);
            y = self.config.top_margin + (d[i].y * self.config.circle_spacing)
            if(point_no == 1) {
                line = "M" + x + ',' + y;
                point_no++;
            }
            else {
                line+= "L" + x + ',' + y;
            }
        }
        return line;
    };

    var create_element = function(type) {
        return document.createElementNS("http://www.w3.org/2000/svg", type);
    };

    var height = this.config.top_margin + this.max_row * this.config.circle_spacing;

    var svg = create_element("svg");

    var line_group = svg.appendChild(create_element("g"));
    var circle_group = svg.appendChild(create_element("g"));

    circle_group.setAttribute("stoke-width", self.config.circle.stroke);
    circle_group.setAttribute("stroke", "#000");

    data.forEach(function(d) {
        var circle = circle_group.appendChild(create_element("circle"));
        circle.setAttribute("cx", (self.config.left_margin + (d.position.column * self.config.branch_spacing)));
        circle.setAttribute("cy", (self.config.top_margin + (d.position.row * self.config.circle_spacing)));
        circle.setAttribute("r", self.config.circle.radius);
        circle.setAttribute("fill", d.position.color);
    })

    line_group.setAttribute("stroke", "#000");
    line_group.setAttribute("stroke-width", this.config.line_width);
    line_group.setAttribute("fill", "none");


    line_array.forEach(function(d) {
        var path = line_group.appendChild(create_element("path"));
        path.setAttribute("d", create_line(d));
        path.setAttribute("stroke", d[0].color);
    })

    location.append(svg);
    svg.setAttribute("width", svg.childNodes[1].getBoundingClientRect().width + this.config.left_margin);
    svg.setAttribute("height", height);
    return svg;
};

module.exports = GitGraph;
