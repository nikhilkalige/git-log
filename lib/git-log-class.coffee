{$$, ScrollView, View} = require 'atom-space-pen-views'

module.exports =

class GitLogView extends View
    @content: ->
        @div class: 'git-log', tabindex: -1, =>
            @subview 'main_panel', new MainPanelView
            @subview 'info_panel', new InfoPanelView

    constructor: ->
        super


class MainPanelView extends ScrollView
    @content:->
        @div class: 'main panels',cellpadding: 0, cellspacing: 0, border: 0, outlet: 'main_panel', =>
            @table =>
                @div class: 'graph', outlet: 'graph'
                @thead =>
                    @tr =>
                        @th class: 'graph-col', =>
                            @p 'Graph'
                        @th class: 'comments', outlet: 'comments', =>
                            @p 'Description'
                        @th class: 'commit', outlet: 'commit', =>
                            @p 'Commit'
                        @th class: 'date', outlet: 'date',  =>
                            @p 'Date'
                        @th class: 'author', outlet: 'author',  =>
                            @p 'Author'
                @tbody outlet: 'body'

    initialize: ->
        super


class InfoPanelView extends ScrollView
    @content: ->
        @div class: 'info panels', =>
            @div class: 'info-data', outlet: 'info_data'
            @div class: 'info-image', outlet: 'info_image'
            @div class: 'info-file', outlet: 'info_file', =>
                @table =>
                    @thead =>
                        @tr =>
                            @th class: 'stat', outlet:'status', =>
                                @p 'Status'
                            @th class: 'file', outlet: 'name', =>
                                @p 'Filename'
                            @th class: 'path', outlet: 'path', =>
                                @p 'Path'
                            @th class: 'add', outlet: 'addition',  =>
                                @p 'Addition'
                            @th class: 'del', outlet: 'deletion',  =>
                                @p 'Deletion'
                    @tbody outlet: 'body'

    add_content: (head, content) ->
        @info_data.append $$ ->
            @h2 =>
                @text head
                @span content

###
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
            @div class: 'info-data', outlet: 'info_data'
            @div class: 'info-image', outlet: 'info_image'
            @div class:'info-file', outlet: 'info_file', =>
                @subview 'status', new ColumnView('Status', 'status')
                @subview 'name', new ColumnView('Filename', 'file')
                @subview 'path', new ColumnView('Path', 'path')
                @subview 'addition', new ColumnView('Addition', 'add')
                @subview 'deletion', new ColumnView('Deletion', 'del')

    add_content: (head, content) ->
        @info_data.append $$ ->
            @h2 =>
                @text head
                @span content


class ColumnView extends View
    @content: (title, class_name, resizable) ->
        @div class: 'column ' + class_name, =>
            @div class: 'list-head', =>
                @h2 title
                @div class:'resize-handle' if resizable
            @div class: 'list', outlet: 'list'

    add_content: (content) ->
        @list.append $$ ->
            @p =>
                @span content
###
