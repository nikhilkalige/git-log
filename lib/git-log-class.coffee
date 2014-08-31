{$$, ScrollView, View} = require 'atom'

module.exports =

class GitLogView extends View
    @content: ->
        @div class: 'git-log native-key-bindings', tabindex: -1, =>
            @subview 'main_panel', new MainPanelView
            @subview 'info_panel', new InfoPanelView

    constructor: ->
        super


class MainPanelView extends ScrollView
    @content:->
        @div class: 'main panels', =>
                @subview 'graph', new ColumnView('Graph', 'graph')
                @div class: 'table', outlet: 'table', =>
                    @subview 'comments', new ColumnView('Description', 'comments', true)
                    @subview 'commit', new ColumnView('Commit', 'commit', true)
                    @subview 'date', new ColumnView('Date', 'date', true)
                    @subview 'author', new ColumnView('Author', 'author')


class InfoPanelView extends ScrollView
    @content: ->
        @div class: 'info panels'

    add_content: (head, content) ->
        @append $$ ->
            @h2 =>
                @text head
                @span content


class ColumnView extends View
    @content: (title, class_name, resizable) ->
        @div class: 'column ' + class_name, =>
            @div class: 'list', =>
                @h2 title
                @div class:'resize-handle' if resizable
            @div class: 'list', outlet: 'list'

    add_content: (content) ->
        @list.append $$ ->
            @p =>
                @span content


