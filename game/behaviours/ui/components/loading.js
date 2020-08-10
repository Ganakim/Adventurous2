import PIXI from 'pixi.js'
import { Spirit } from '../../../spirits'
export default (options, events)=>({
  init(){
    // console.log(`${options.progress}/${options.total} ${Math.floor((options.progress/options.total)*100)}%`)
    var menu = {zIndex:10, x:Game.app.screen.width/2, y:Game.app.screen.height/3, height:450, width:600, anchor:{x:.5, y:.5}}
    var loadingBar = {x:menu.width/2-150, y:275, width:300, height:10}
    
    Tools.extend(this, menu)

    var bar = new PIXI.Graphics()
    bar.lineStyle(3, 0x000000)
    bar.drawRoundedRect(loadingBar.x, loadingBar.y, loadingBar.width, loadingBar.height)
    bar.beginFill(0x000000, .4)
    bar.drawRoundedRect(loadingBar.x, loadingBar.y, loadingBar.width * (options.progress/options.total), loadingBar.height)

    this.addChild(
      new Spirit('ui', 'pane', {width:menu.width, height:menu.height}),
      new Spirit('ui', 'label', {x:menu.width/2, y:175, text:'Loading... Please wait', style:Game.styles.get('menu'), anchor:{x:.5}}),
      new Spirit('ui', 'label', {x:menu.width/2, y:240, text:`${options.verbage || 'Loading:'} ${options.item} ${options.progress}/${options.total} ${Math.floor((options.progress/options.total)*100)}%`, style:Game.styles.temp('menu', {fontSize: 16}), anchor:{x:.5}}),
      bar
    )
  },
  step(){
    
  }
})
