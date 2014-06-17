{ScrollView} = require 'atom'

module.exports =
class GitLogView extends ScrollView

  @content: ->
    @div class: 'markdown-preview native-key-bindings', tabindex: -1

  getTitle: ->
    "Git-Log"

###{View} = require 'atom'

module.exports =
class GitLogView extends View
  @content: ->
    @div class: 'git-log overlay from-top', =>
      @div "The GitLog package is Alive! It's ALIVE!", class: "message"

  initialize: (serializeState) ->
    atom.workspaceView.command "git-log:toggle", => @toggle()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  toggle: ->
    console.log "GitLogView was toggled!"
    if @hasParent()
      @detach()
    else
      atom.workspaceView.append(this)
###
