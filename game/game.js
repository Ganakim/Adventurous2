import PIXI from 'pixi.js'
import './update'
import { Spirit } from './spirits'

Game = {
  state: false,
  fullScreen: document.fullscreenElement || document.webkitFullscreenElement,
  targetWidth: 1920,
  targetHeight: 1080,
  spirits: [],
  logs: [],
  loader: PIXI.Loader.shared,
  textures: {},
  styles: {
    menu: new PIXI.TextStyle({
      name: 'menu',
      fill: "white",
      fontFamily: "Verdana",
      strokeThickness: 1
    }),
    fal: new PIXI.TextStyle({
      name: 'icon',
      fill: 0xFF0000,
      fontFamily: 'Font Awesome 5 Pro',
      fontWeight: 300
    }),
    far: new PIXI.TextStyle({
      name: 'icon',
      fill: 0xFF0000,
      fontFamily: 'Font Awesome 5 Pro',
      fontWeight: 400
    }),
    fas: new PIXI.TextStyle({
      name: 'icon',
      fill: 0xFF0000,
      fontFamily: 'Font Awesome 5 Pro',
      fontWeight: 900
    }),
    fad: new PIXI.TextStyle({
      name: 'icon',
      fill: 0xFF0000,
      fontFamily: 'Font Awesome 5 Duotone',
      fontWeight: 900
    }),
    fab: new PIXI.TextStyle({
      name: 'icon',
      fill: 0xFF0000,
      fontFamily: 'Font Awesome 5 Brands',
      fontWeight: 400
    }),
    log: new PIXI.TextStyle({
      name: 'log',
      fill: 'white',
      fontSize: 20,
      fontFamily: 'verdana'
    }),
    get(name, changes){
      var tempStyle = changes ? this[name].clone() : this[name]
      return changes ? Tools.extend(tempStyle, changes) : tempStyle
    },
  },
  init(){
    this.app = new PIXI.Application({width:this.targetWidth, height:this.targetHeight, transparent:true, antialias:true})
    this.stage = this.app.stage
    this.stage.interactive = true
    this.resize()
    $('#Home').append(this.app.view)
    Session.set('fps', 0)
    window.requestAnimationFrame(GameLoop)
    this.resize()
    this.layoutUI('splash')
    window.addEventListener('resize', this.resize)
    this.stage.on('pointermove', (e)=>{
      Session.set('mouse', {x:Math.round(e.data.global.x), y:Math.round(e.data.global.y)})
    })
  },
  units(units = 0, to){
    if(to == 'px'){
      return {
        h: units * ($('#UIOverlay').innerWidth()/Game.app.screen.width),
        v: units * ($('#UIOverlay').innerHeight()/Game.app.screen.height)
      }
    }
  },
  layoutUI(mode, info){
    Game.layout = mode
    for(var spirit of this.spirits.filter(a=>a.layer == 'ui')){
      spirit.remove()
    }
    switch(mode){
      case 'combat':
        // console.log(info)
        Game.background = new Spirit('ui', 'img', {src:'areas/inn', width:Game.app.screen.width, height:'auto'})
        Game.nav = new Spirit('ui', 'nav', {x:10, y:10, z:10})
        this.stage.addChild(Game.background, new Spirit('ui', 'bottom'))
      break
      default:
        this.stage.addChild(new Spirit('ui', mode, info))
    }
  },
  resize(){
    if(!Game.focus){
      Session.set('screenSize', `${$('html').innerWidth()} X ${$('html').innerHeight()}`)
      var fs = document.fullscreenElement || document.msFullScreenElement
      var shortSide = $('#Home').innerWidth() < $('#Home').innerHeight() ? 'Width' : 'Height'
      var grow = ((($('#Home').innerWidth()*9)/$('#Home').innerHeight())/9)*Game.targetHeight
      if(fs){
        Game.app.renderer.resize(shortSide == 'Width' ? Game.targetHeight : Math.floor(grow), Game.targetHeight)
        $('#Home canvas').css({width:'100vw', height:`${$('#Home')[`inner${shortSide}`]()}px`, border:'1px solid white'})
      }else{
        Game.app.renderer.resize(Game.targetWidth, Game.targetHeight)
        $('#Home canvas').css({width:'80%', height:'auto', border:'1px solid black'})
      }
      if($('#Home canvas').offset()){
        $('#UIOverlay').offset({left:$('#Home canvas').offset().left})
      }
      $('#UIOverlay').innerWidth(Math.ceil($('#Home canvas').innerWidth()))
      $('#UIOverlay').innerHeight(Math.ceil($('#Home canvas').innerHeight()))

      for(var spirit of Game.spirits.filter(a=>a.resize)){
        spirit.resize()
      }
    }else{
      delete Game.focus
    }
  },
  currentParty(newParty, callback){
    if(newParty){
      Meteor.call('setParty', newParty, (err, res)=>{
        if(err){
          console.log(err)
        }else if(callback){
          callback(new Party(Meteor.user().party))
        }
      })
    }else{
      return Meteor.user().party ? new Party(Meteor.user().party) : false
    }
  },
  loadAssets(){
    Game.layoutUI('loading', {progress:0, total:1})
    // Session.set('assetPickerList', [
    //   'achievements',
    //   'areas',
    //   'characters',
    //   'charParts',
    //   'items',
    //   'monsters',
    //   'ui',
    // ])
    Meteor.call('readAssets', Session.get('assetPickerList'), (err, res)=>{
      if(err){
        console.log('LOAD ASSETS ERROR:', err)
      }else{
        var total = 0
        var loaded = 0
        read([''], res)
        function read(path, dir){
          dir.files.map(a=>{
            var img = new Image()
            img.onload = function(){
              Game.textures[path.concat(a.replace(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, '')).join('/').slice(1)] = new PIXI.Texture.from(this)
              loaded++
              Game.layoutUI('loading', {verbage:'Loading Texture:', item:a.replace(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i, ''), progress:loaded, total:total})
              if(loaded == total){
                Game.layoutUI('mainMenu')
              }
            }
            img.src = path.concat(a).join('/')
            total++
          })
          delete dir.files
          Object.entries(dir).map(([dirName, a])=>read(path.concat(dirName), a))
        }
        Game.layoutUI('loading', {verbage:'Loading Textures', item:'', progress:0, total:1})
      }
    })
  }
}


// Belongs in credits: MM