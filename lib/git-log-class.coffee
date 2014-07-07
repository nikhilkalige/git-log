{ScrollView, View} = require 'atom'

module.exports =

class GitLogView extends ScrollView
    @content: ->
        @div class: 'git-log pane-item native-key-bindings', tabindex: -1, =>
            @subview 'graph', new GraphView()
            @subview 'comments', new CommentsView()
            @subview 'commit', new CommitView()
            @subview 'date', new DateView()
            @subview 'author', new AuthorView()

    initialize: ->
        super

class GraphView extends View
    @content: ->
        @div class: 'graph', outlet: 'graph'

class CommentsView extends View
    @content: ->
        @div =>
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'
            @h2 'Comments'


class CommitView extends View
    @content: ->
        @div =>
            @h2 'Commit'

class DateView extends View
    @content: ->
        @div =>
            @h2 'Date'

class AuthorView extends View
    @content: ->
        @div =>
            @h2 'Author'
