export default (id, options, events)=>({
  init(){
    var monster = Mosters.findOne(id)
    var sprite = new PIXI.Sprite.from(Game.textures[`monsters-${monster.texture}`])
    this.addChild(sprite)
  },
  step(){
    
  }
})