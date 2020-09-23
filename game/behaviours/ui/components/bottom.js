import { Spirit } from '../../../spirits'
export default (options, events)=>({
  init(){
    this.bottom = new PIXI.Sprite(Game.textures['ui/bottom'])

    var consoleBg = new PIXI.Graphics()
    consoleBg.beginFill(0x101010)
    consoleBg.drawRect(0, Game.app.screen.height - this.bottomHeight(), this.bottomHeight(), this.bottomHeight())

    Game.console = new PIXI.Container()
    Game.console.y = Game.app.screen.height - this.bottomHeight()
    Game.console.interactive = true

    this.addChild(this.bottom, consoleBg, Game.console)

    this.characters = []

    var scrollStart
    this.scrollPos = 0

    consoleBg.on('touchmove', (e)=>{
      if(e.target == consoleBg){
        if(scrollStart){
          this.scrollPos += e.data.global.y < scrollStart ? 2 : -2
          this.scrollPos = this.scrollPos < 0 ? 0 : (this.scrollPos > 100 ? 100 : this.scrollPos)
          this.resize()
        }
        scrollStart = e.data.global.y
      }
    })

    Game.console.on('pointerover', (e)=>{
      console.log('listen to scroll')
    })

    Game.console.on('pointerout', (e)=>{
      console.log('stop listening')
    })

    var parseGuide = {
      party:id=>{
        var party = new Party(id)
        return {text:`{ ${party.name} }`, color:0x34b1eb, callbacks:function(){
          var open = false
          var infoPane
          return {
            pressed(){
              if(open = !open){
                infoPane = new Spirit('ui', 'pane', {x:this.width/2, y:0, width:200, height:300, anchor:{x:.5,y:1}})
                this.addChild(infoPane)
              }else{
                infoPane.remove()
              }
            }
          }
        }()}
      },
      status:id=>{
        var status = new Status(id)
        return {text:`[ ${status.name} ]`, color:0x1b822c, info:status}
      }
    }

    Game.console.log = (...entries)=>{
      var log = []
      entries.map(entry=>{
        var formattedEntry = []
        var formattedLine = []
        entry.split(/(\[[0-9a-zA-Z_-]*:[^\]-]*]){1}/g).map((part, partIndex)=>{
          var matched = Tools.match(part, /\[(?<type>[0-9a-zA-Z_-]*):(?<text>[^\]-]*)]/g)[0] || false
          var parsedPart = matched ?
            matched.groups.type.match(/0x[0-9a-fA-F]{6}/) ?
              {text:matched.groups.text, color:matched.groups.type} :
              parseGuide[matched.groups.type] ?
                parseGuide[matched.groups.type](matched.groups.text) :
                {text:'ERROR', color:0xFF0000} :
              {text:part}
          parsedPart.text.split(/(?<![{\[])\s(?![}\]])/).map(word=>{
            var parsedWord = {part: partIndex}
            Tools.extend(parsedWord, parsedPart)
            parsedWord.text = word
            if(Tools.textMetrics(formattedLine.map(a=>a.text).concat(word).join(''), Game.styles.get('log')).width <= this.bottomHeight()){
              var lastBox = formattedLine[formattedLine.length-1]
              if(lastBox && lastBox.part == parsedWord.part){
                lastBox.text = lastBox.text.concat(' ', word)
              }else{
                formattedLine.push(parsedWord)
              }
            }else{
              formattedEntry.push(formattedLine)
              formattedLine = [parsedWord]
            }
          })
        })
        formattedEntry.push(formattedLine)
        log.push(formattedEntry)
      })
      Game.logs.push(log)
    }

    Game.console.writeLogs = ()=>{
      while(Game.console.children.length){
        Game.console.children[0].remove()
      }
      var y = 0
      Game.logs.map(log=>{
        log.map(entry=>{
          entry.map(line=>{
            var x = 0
            line.map(word=>{
              var style = Game.styles.get('log', {fill: word.color})
              Game.console.addChild(new Spirit('ui', 'label', {x:x, y:y, text:word.text, style:style}, word.callbacks || {}))
              x += Tools.textMetrics(word.text, style).width
            })
            y += Tools.textMetrics('', Game.styles.get('log')).height
          })
          y += 10
        })
      })
    }
    // Re-designating the clear method from PIXI to erase
    Game.console.erase = Game.console.clear

    Game.console.clear = ()=>{
      Game.logs = []
      while(Game.console.children.length){
        Game.console.children[0].remove()
      }
    }
    
    this.resize()
  },
  step(){
    if(Game.console.children.length < Game.logs.flat(3).length){
      Game.console.writeLogs()
    }
    var party = Game.currentParty()
    if(party && this.characters.length != (Object.keys(party.front).length + Object.keys(party.back).length)){
      console.log('stepRedraw', this.characters.length, Object.keys(party.front).length + Object.keys(party.back).length)
      this.redrawParty()
    }
    // Game.console.y = (Game.app.screen.height - this.bottomHeight()) - ((Game.console.height - this.bottomHeight()) * (this.scrollPos / 100))
  },
  resize(){
    this.bottom.width = Game.app.screen.width
    this.bottom.height = this.bottomHeight()
    this.bottom.y = Game.app.screen.height - this.bottomHeight()
    this.redrawParty()
  },
  kill(){
    delete Game.console
  },
  bottomHeight(){
    return (Game.app.screen.width * Game.textures['ui/bottom'].height)/Game.textures['ui/bottom'].width
  },
  redrawParty(){
    if(!this.drawingParty){
      this.drawingParty = true
      var party = Game.currentParty()
      while(this.characters.length){
        this.characters.shift().remove()
      }
      var spots = Object.keys(party.front).concat(Object.keys(party.back).map(a=>parseInt(a)+.5))
      var bounds = {
        left: Math.min(...spots),
        right: Math.max(...spots),
        rows: (Object.keys(party.front).length && Object.keys(party.back).length),
        size: `${Game.app.screen.width/2}:${this.bottomHeight()}`
      }
      console.log(party.front, party.back)
      var emptyBox = new PIXI.Graphics()
      emptyBox.beginFill(0xFFFFFF)
      for(var i=bounds.left;i<=bounds.right;i++){
        var x = (Game.app.screen.width/4) + 100 + ((((Game.app.screen.width/2)-200)/(bounds.right-bounds.left)) * (i-bounds.left))
        if(party.front[i]){
          var portrait = new Spirit('ui', 'portrait', {x:x, y:750, character: party.front[i], anchor:{x:.5, y:.5}})
          this.characters.push(portrait)
          this.addChild(portrait)
        }else{
          this.addChild(emptyBox.drawRect(x - 50, 750 - 50, 100, 100))
        }
        x = (Game.app.screen.width/4) + 100 + ((((Game.app.screen.width/2)-200)/(bounds.right-bounds.left)) * ((i+.5-bounds.left)))
        if(party.back[i]){
          var portrait = new Spirit('ui', 'portrait', {x:x, y:950, character: party.back[i], anchor:{x:.5, y:.5}})
          this.characters.push(portrait)
          this.addChild(portrait)
        }else{
          this.addChild(emptyBox.drawRect(x - 50, 950 - 50, 100, 100))
        }
      }
      delete this.drawingParty
    }
  }
})

