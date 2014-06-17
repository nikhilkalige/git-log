{ScrollView} = require 'atom'

module.exports =
class GitLogView extends ScrollView

  @content: ->
    @div class: 'markdown-preview native-key-bindings', tabindex: -1
