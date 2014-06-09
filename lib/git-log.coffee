GitLogView = require './git-log-view'

module.exports =
  gitLogView: null

  activate: (state) ->
    @gitLogView = new GitLogView(state.gitLogViewState)

  deactivate: ->
    @gitLogView.destroy()

  serialize: ->
    gitLogViewState: @gitLogView.serialize()
