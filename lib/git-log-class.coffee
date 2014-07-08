{$$, ScrollView, View} = require 'atom'

module.exports =

class GitLogView extends ScrollView
    @content: ->
        @div class: 'git-log native-key-bindings', tabindex: -1, =>
            @div class: 'panels', =>
                @subview 'graph', new ColumnView('Graph', 'graph')
                @subview 'comments', new ColumnView('Description', 'comments')
                @subview 'commit', new ColumnView('Commit', 'commit')
                @subview 'date', new ColumnView('Date', 'date')
                @subview 'author', new ColumnView('Author', 'author')

    constructor: ->
        super

class ColumnView extends View
    @content: (title, class_name) ->
        @div class: 'column ' + class_name, =>
            @div class: 'list', =>
                @h2 title
            @div class: 'list background', outlet: 'list'

    add_content: (content) ->
        @list.append $$ ->
            @p content
