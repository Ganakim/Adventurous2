import PIXI from 'pixi.js'
import { Spirit } from '../../../spirits'
export default (options, events)=>({
  init(){
    var menu = {zIndex:10, x:Game.app.screen.width/2, y:Game.app.screen.height/3, height:450, width:600, anchor:{x:.5, y:.5}}
    
    Tools.extend(this, menu)

    this.addChild(
      new Spirit('ui', 'pane', {width:menu.width, height:menu.height}),
      new Spirit('ui', 'button', {width:150, height:80, x:menu.width/2, y:300, text:'Play', anchor:{x:.5}}, {pressed(){
        Game.loadAssets()
      }})
    )
  },
  step(){
    
  }
})
