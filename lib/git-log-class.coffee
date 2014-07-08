{$$, ScrollView, View} = require 'atom'

module.exports =

class GitLogView extends ScrollView
    @content: ->
        @div class: 'git-log native-key-bindings', tabindex: -1, =>
            @div class: 'graph-wrapper', outlet: 'graph'

            @table width: '100%', cellpadding: 0, cellspacing: 0, border: 0, class: 'logs-table', =>
              @thead =>
                @tr =>
                  @th 'Graph'
                  @th 'Description'
                  @th 'Commit'
                  @th 'Date'
                  @th 'Author'

              @tbody outlet: 'table_body'
