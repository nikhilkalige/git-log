d3 = require('d3');

function GitGraph(data) {
    this.config = this.set_config();
    this.set_position(data);
}

GitGraph.prototype.set_config = function() {
    var config = {};
    config.circle = {};
    config.circle.radius = 2;
    config.circle.stroke = 1.1;
    config.circle_spacing = 20;
    config.branch_spacing = 40;
    config.line_width = 4;
    return config;
};

GitGraph.prototype.set_position = function(data) {
    var _i, _len;
    for(_i=0; _len = data.length, _i < _len; _i++) {
        var commit = data[_i];

    }
}

module.exports = GitGraph;
