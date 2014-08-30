{$$, ScrollView, View} = require 'atom'

module.exports =

class InfoPanelView extends View
    @content: ->
        @div class: 'info-panel', =>
            @p "asdf"