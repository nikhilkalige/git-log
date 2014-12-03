{$$, EditorView, View} = require 'atom'

module.exports =

class GitLogInputView extends View
    @content: ->
        @div class: 'overlay git-log-input from-top mini', =>
            @subview 'inputEditor', new EditorView(mini: true, placeholderText: 'Commit Start: default = 0')

    constructor: ->
        super

