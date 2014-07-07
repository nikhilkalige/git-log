{ScrollView, View} = require 'atom'

module.exports =

class GitLogView extends ScrollView
    @content: ->
        @div class: 'git-log pane-item native-key-bindings', tabindex: -1, =>
            @div class: 'underlay', outlet: 'underlay'
            @subview 'graph', new GraphView()
            @subview 'comments', new CommentsView()
            @subview 'commit', new CommitView()
            @subview 'date', new DateView()
            @subview 'author', new AuthorView()

    initialize: ->
        super
        console.log "asdf"

    constructor: ->
        super
        console.log "asdf"


class GraphView extends View
    @content: ->
        @div class: 'graph column', outlet: 'graph', =>
            @h2 'Graph'

class CommentsView extends View
    @content: ->
        @div class: 'description column', outlet: 'comments', =>
            @h2 'Description'

class CommitView extends View
    @content: ->
        @div class: 'column commit', outlet: 'commit', =>
            @h2 'Commit'

class DateView extends View
    @content: ->
        @div class: 'column date', outlet: 'date', =>
            @h2 'Date'

class AuthorView extends View
    @content: ->
        @div class: 'column author', outlet: 'author', =>
            @h2 'Author'
