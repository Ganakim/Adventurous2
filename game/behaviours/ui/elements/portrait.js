export default (options, events)=>({
  init(){
    console.log(options.character)
    Object.keys(Game.textures).filter((a)=>a.includes(`${options.character.class.name}_${options.character.gender}`)).map((layer, i)=>{
      var partInfo = options.character.class.layers[options.character.gender + (`00${i}`.slice(-2))]
      console.log(partInfo)
      var part = new PIXI.Sprite(Game.textures[layer])
      part.x = partInfo.x
      part.y = partInfo.y
      part.tint = options.character.colors ? options.character.colors[partInfo.part] || partInfo.def : partInfo.def
      this.addChild(part)
    })
  },
  step(){
    
  }
})
