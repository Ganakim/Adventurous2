import './home.html'

Template.home.onRendered(()=>{
  var type = "WebGL"
  if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
  }
  PIXI.utils.sayHello(type)
  Game.state = 'initializing'
  Session.set('state', 'initializing')

  Tracker.autorun(()=>{
    console.log('Waiting for user.')
    if(Meteor.user() && Session.get('subscribed') && Game.state == 'initializing'){
      console.log('User found, starting game')
      // WebFont.load({
      //   custom: {
      //     families: [
      //       'Font Awesome 5 Pro:900,400,300',
      //       'Font Awesome 5 Duotone:900',
      //       'Font Awesome 5 Brands:400'
      //     ],
      //     urls: ['//use.fontawesome.com/releases/v5.14.0/css/all.css']
      //   },
      //   active:e=>{
      //     console.log('fonts loaded!')
          Game.init()
          Game.state = 'running'
          Session.set('state', 'running')
      //   }
      // })
    }
  })

  if(!Session.get('assetPickerList')){
    Session.set('assetPickerList', [])
  }
  Session.get('assetPickerList').map(a=>{
    $(`#${a}Checkbox`).prop('checked', true)
  })
})

Template.home.helpers({
  fullscreenIcon(){
    return Session.get('fsIcon') || 'expand'
  },
  gameNavIcons(){
    return [
      {icon:'cog', style:'fad', size:'fa-2x', action(){
        console.log('Open settings')
      }}
    ]
  },
  assetOptions(){
    return [
      'achievements',
      'areas',
      'characters',
      'charParts',
      'items',
      'monsters',
      'ui',
    ]
  }
})

Template.home.events({
  'keyup .loginMenu input'(e){
    if(e.key == 'Enter'){
      Meteor.loginWithPassword($('#Username').val(), $('#Password').val())
    }
  },
  'click .login'(e){
    Meteor.loginWithPassword($('#Username').val(), $('#Password').val())
  },
  'click .fs'(){
    var elem = $('#Home')[0]
    if(document.fullscreenElement || document.webkitFullscreenElement){
      if(document.exitFullscreen){
        document.exitFullscreen().catch(err=>console.log(err))
      }else if(document.msExitFullscreen){
        document.msExitFullscreen()
      }
    }else{
      if(elem.requestFullscreen){
        elem.requestFullscreen().catch(err=>console.log(err))
      }else if(elem.mozRequestFullScreen){
        elem.mozRequestFullScreen()
      }else if(elem.webkitRequestFullscreen){
        elem.webkitRequestFullscreen()
      }else if(elem.msRequestFullscreen){
        elem.msRequestFullscreen()
      }
    }
    setTimeout(()=>{Game.resize()}, 100)
  },
  'fullscreenchange #Home, MSFullscreenChange #Home'(){
    Session.set('fsIcon', (document.fullscreenElement || document.webkitFullscreenElement) ? 'compress' : 'expand')
  },
  'click #GameNavIcons i'(){
    this.action()
  },
  'change #AssetsPickerList input'(){
    console.log(this)
    Session.set('assetPickerList', Session.get('assetPickerList').concat(this.toString()))
  }
})
