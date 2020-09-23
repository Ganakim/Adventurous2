import { Spirit } from '../../../spirits'
export default (options, events)=>({
  init(){
    //add imgs for each icon that should display at any given time
    this.addChild(new Spirit('ui', 'label', {x:0, y:0, text:'\f013', style:Game.styles.get('fad')}))
  },
  step(){
    
  }
})