{$$, SelectListView} = require 'atom-space-pen-views'


module.exports =

class RepoListView extends SelectListView
    initialize: (@listOfItems) ->
        super
        @addClass('modal overlay from-top')
        @storeFocusedElement()
        @panel = atom.workspace.addModalPanel(item: this, visible: true)
        @panel.show()
        @setItems(@listOfItems)
        @focusFilterEditor()

    getFilterKey: ->
        'repo_name'

    viewForItem: (item) ->
        $$ -> @li(item.repo_name)

    cancelled: ->
        @panel.hide()
        @panel.destroy()

    confirmed: (item) ->
        @cancel()
        options= {
            'repo': item
        };
        uri = "git-log://" + item.repo_name
        old_pane = atom.workspace.paneForURI(uri)
        old_pane.destroyItem old_pane.itemForURI(uri)  if old_pane
        atom.workspace.open uri, options
