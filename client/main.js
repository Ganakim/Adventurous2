import PIXI from 'pixi.js'
import './main.html'
import './imports'

Template.body.onCreated(()=>{
  Session.set('page', 'home')
  Session.set('mouse', {x:0, y:0})
})

Tracker.autorun(()=>{
  if(Session.get('page') != 'home' && Game.state == 'running'){
    Game.state = 'stopped'
    Session.set('state', 'stopped')
  }
})

Template.body.events({
  'click [dropdown]'(e){
    const target = $(e.target).closest('[dropdown]')
    const dropTarget = $(target.attr('dropdown'))
    if(dropTarget[0]){
      e.stopPropagation()
      dropTarget.attr({dropdown: dropTarget.attr('dropdown') == 'true' ? 'false' : 'true'})
    }
  },
  'click'(e){
    if(!($(e.target).is('[dropdown]') || $(e.target).is('[dropdown] *'))){
      $('[dropdown="true"]').attr({dropdown: 'false'})
    }
  },
})

window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame
Session.set('subscribed', false)

var ready = [
  Meteor.subscribe('users', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('user', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('areas', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('quests', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('parties', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('characters', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('classes', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('skills', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('items', {onError(){console.log(arguments[0].message)}}),
  Meteor.subscribe('statuses', {onError(){console.log(arguments[0].message)}})
]

Tracker.autorun(()=>{
  if(ready.every(a=>a.ready())){
    Session.set('subscribed', true)
  }
})
