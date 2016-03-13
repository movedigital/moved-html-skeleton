_ = require 'lodash'
Home = require './pages/home'

routes = {
  'home': Home
}

$(document).foundation()
$ ->
  # Start Routing
  page = $('#page').data('page')
  if page && routes[page]
    newPage = new routes[page]

  return true
