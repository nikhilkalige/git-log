{$$, ScrollView, View} = require 'atom'

module.exports =

class GitLogView extends ScrollView
    @content: ->
        @div class: 'git-log native-key-bindings', tabindex: -1, =>
            @subview 'main_panel', new MainPanelView
            @subview 'info_panel', new InfoPanelView
            #@div class: 'panels', =>
            #    @subview 'graph', new ColumnView('Graph', 'graph')
            #    @div class: 'table', outlet: 'table', =>
            #        @subview 'comments', new ColumnView('Description', 'comments', true)
            #        @subview 'commit', new ColumnView('Commit', 'commit', true)
            #        @subview 'date', new ColumnView('Date', 'date', true)
            #        @subview 'author', new ColumnView('Author', 'author')

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
        @div class: 'info panels', =>
            p 'asdfasdfasdfasdf'
            p 'asdfasdfasdfasdf'
            p 'asdfasdfasdfasdf'
            p 'asdfasdfasdfasdf'
            p 'asdfasdfasdfasdf'
            


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
