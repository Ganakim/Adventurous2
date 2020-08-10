import PIXI from 'pixi.js'
export default (options, events)=>({
  init(){
    Tools.extend(this, options)

    var tex = Game.textures[options.src]
    var img = new PIXI.Sprite(tex)
    if(options.height == 'auto'){
      img.width = options.width
      img.height = (tex.height*options.width)/tex.width
    }else if(options.width == 'auto'){
      img.width = (tex.width/tex.height)*options.height
      img.height = options.height
    }else{
      img.width = options.width
      img.height = options.height
    }
    this.addChild(img)

    if(events.enter){
      this.on('pointerover', events.enter)
    }
    if(events.pressed){
      this.on('pointertap', events.pressed)
    }
    if(events.leave){
      this.on('pointerout', events.leave)
    }
  },
  step(){
    
  }
})