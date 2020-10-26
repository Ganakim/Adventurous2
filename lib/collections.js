if (Meteor.isClient){
  import { Spirit } from '../game/spirits'

// Static:
// Storing functions: https://stackoverflow.com/questions/33284478/store-function-in-database-with-mongodb-in-meteor
Classes = new Mongo.Collection('classes')
Skills = new Mongo.Collection('skills')
Items = new Mongo.Collection('items')
Statuses = new Mongo.Collection('statuses')
Monsters = new Mongo.Collection('monsters')

// Dynamic:
Areas = new Mongo.Collection('areas')
Quests = new Mongo.Collection('quests')
Parties = new Mongo.Collection('parties')
Characters = new Mongo.Collection('characters')

/*=====================================================================================================*/
/*Tempo's suggestion*/


Collections = {
  user: Meteor.users,
  area: Areas,
  quest: Quests,
  party: Parties,
  class: Classes,
  skills: Skills,
  item: Items,
  status: Statuses
}


Marble = class Marble extends Spirit{
  
  constructor(data, spiritId){
    
    //parent
    if (spiritId){
      //to complete
    }

    //id
    this.id = data._id
    
    //properties
    Tools.extend(this, data, ['name', 'colors', 'level', 'stats', 'skills', 'immunities', 'weaknesses', 'HP', 'MP'])
    for (var thisProperty of ['equipment' /*maybe more*/]){
      this[thisProperty] = data[thisProperty].map(anId => Items.findOne(anId))
    }
    for (var thisProperty of ['skills' /*maybe more*/]){
      var subdata = Collections[thisProperty].findOne(data[thisProperty])
      this[thisProperty] = subdata._id
      Tools.extend(this[thisProperty], subdata, ['name', 'description'])
    }
    
    /*  
    //without id
        if (['name', 'gender', 'colors', 'experience', 'gold', 'stats', 'HP', 'MP'].includes(thisProperty)){
            this[thisProperty] = data[thisProperty]
      //with id
        }else if (['class','skills'].includes(thisProperty)){
          subdata = Collections[thisProperty].findOne(data[thisProperty])
          this[thisProperty] = subdata._id
          Tools.extend(this[thisProperty], subdata, ['name', 'description'])
      //list of ids
        }else if (['rewards','equipment','inventory'].includes(thisProperty)){
          this[thisProperty] = data[thisProperty].map(anId => Items.findOne(anId))
        }
*/
    //stats
    if (this.stats){  
      for(var thisStat of ['str', 'agi', 'res', 'int', 'wis', 'cha']){
        this[thisStat] = function(newValue){
          if(newValue){
            this.stats[thisStat] = newValue
          }
          return {
            value: this.stats[stat],
            level: Math.round((15.4*this.stats[stat])/(this.stats[stat]+12))  
            //calculation of the level (this formula works, intead of 'if' conditions)
          }
        }
      }
    }
  }
  
  get_stat(statName){ //gets the value of a secondary stat from primary stats, equipment pieces and effects
    var base = 0
    var charLevel = this.level 
    for (var stat of ['str', 'agi', 'res', 'int', 'wis', 'cha']){
      if (secStatsCalculation[statName][stat]){
        var statLevel = this[stat].level
        base += eval(secStatsCalculation[statName][stat][str(statLevel)])(charLevel)
        //                ex:            poisResi   agi        5             231
      }
    }
    var fromEquipment = 0
    for (var equip of this.equipment){
      fromEquipment += (equip[statName].add ? equip[statName].add : 0) + (equip[statName].mult ? equip[statName].mult*base : 0)  
      // /!\ requires the equipment format to be an object with the property 'statName' including additionnal and/or multiplicative values
    }
    var fromEffects = 0
    for (var effect of this.effects){ //this.effects (does not exist yet) ? or this.status ?
      fromEffect += (effect[statName].add ? effect[statName].add : 0) + (effect[statName].mult ? effect[statName].mult*base : 0)
    }
     
    return base + fromEquipment + fromEffects
  }

  criticalChance(){
    chance = this.get_stat(criticalChance)
    bool = chance > Math.random()
    if (bool){/*animation*/}
    return bool
  }

  attacks(attackType, targets = []){
    
    if (targets == []){
      //choose the target, supposedly one target only
    }

    var attackData = {}
    attackData.type = attackType
    this.equipment[0] ? attackData.type = this.equipment[0].type : attackData.type = 'hand' //'hand' or smth else (ie no wpn)
    attackData.accuracy = this.get_stat('accuracy')
    attackData.quickness = this.get_stat('quickness')

    var value = get_stat('damage_' + attackType)
    if (criticalChance()){value *= 5}
    attackData.value = value

    for (var thisTarget of targets){
      thisTarget.isAttacked(attackData)
    }
    //to complete : case when repetition of attacks
  }

  isAttacked(attackData){
   //avoidance
    if (!(['spell', 'idontknow'].includes(attackData.type)) && (Math.random() < this.get_stat('avoidance')) && !(Math.random() < attackData.accuracy)){
      //animation

    } else {          
   //resistance
      var HPloss = attackData.value - this.get_stat('resistance_' + attackData.type) //secStats need to be named like "resistance_statname" or "damage_statname"
      if (this.immunities.includes(attackData.type)){
        HPloss = Math.round(HPloss/10)
      }
      if (this.weaknesses.includes(attackData.type)){
        HPloss *= 10
      }
   //block
      if (['sword', 'hammer', 'bow', 'axe', 'stick', 'hand'].includes(attackData.type) && (Math.random() < this.get_stat('block')) && !(Math.random() < attackData.quickness)){
        HPloss = Math.round(HPloss/5)
        //animation
      }
  
    this.losesHP(HPloss)
    }
  }

  gainsHP(value){
    this.hp.current = min(this.hp.current + value, this.hp.max)
    //animation
  }

  losesHP(value){
    this.HP.current = max(this.HP.current - value, 0)
    //animation
    
    if (this.HP.current == 0){
      if (criticalChance()){
        this.HP.current = 1
      }else{
        //dealing with death
      }
    }
  }

  gainsMP(value){
    this.MP.current = Math.min(this.MP.current + value, this.MP.max)
  }

  losesMP(value){
    this.MP.current = max(this.MP.current - value, 0)
  }

  gainsXP(value){
    this.XP += value
    //animation
    
    //level up
    if (this.XP.current >= this.XP.max){
      this.level += 1
      this.XP.current -= this.XP.max
      var newMax //calculation of newMax, based on the level
      this.XP.max = newMax
    }
  }

  losesXP(value){
    this.XP = Math.max(this.XP.current - value, 0)
    //animation
  }

  gainsGold(value){
    this.gold += value
  }

  losesGold(value){
    this.gold = Math.max(this.gold - value, 0)
  }

  isAlive(){
    return this.HP.current > 0
  }
}

Character = class Character extends Marble {
  constructor(id){
    //parent
    var data = Characters.findOne(id)
    super(data, data.spiritId)

    //Character's properties
    Tools.extend(this, data, ['gender', 'gold', 'experience'])
    for (var thisProperty of ['inventory']){
      this[thisProperty] = data[thisProperty].map(anId => Items.findOne(anId))
    }
    for (var thisProperty of ['class']){
      var subdata = Collections[thisProperty].findOne(data[thisProperty])
      this[thisProperty] = subdata._id
      Tools.extend(this[thisProperty], subdata, ['name', 'description']) //copied-past from QofM, might be to modify
    }
    this.savedAction = {action:null, targets:null}
    
    
  }
}

Monster = class Monster extends Marble{
  constructor(id){
    //parent
    var data = Characters.findOne(id)
    super(data, data.spiritId)
 
    //Monster's properties
    Tools.extend(this, data, ['isBoss', 'loots'])
  }
}

Party = class Party{
  constructor(id){
    if (id){
      var data = Parties.finOne(id)
      this.id = data._id
      Tools.extend(this, data, ['name'])
      this.location = data.location
      this.location.area = new Area(data.location.area)
      this.leader = new Character(data.leader)
      this.front = data.front.map(id => new Character(id))  //data.front is an array of ids
      this.back = data.back.map(id => new Character(id))  //same
    }else{
    //creates a void party
      //generation of an id
      //dealing with location
      //no leader
      this.front = Array(10).fill(null)
      this.back = Array(10).fill(null)
    }
  }
}

Combat = class Combat{
  constructor(party, horde){
    this.party = party
    this.horde = horde
  }

  init(){
    //initialisation
    //animation
  }

  fightPhase(){
    //order
    var marblesOnField = []
    marblesOnField.concat(this.party.front, this.party.back, this.horde.front, this.horde.back)
    marblesOnField.filter(x => x==null ? False : x.HP.current>0) //existing (!=null) and alive (HP>0) marbles only
    var order = marblesOnField.sort((a,b) => a.get_stat(charisma) - b.get_stat(charisma)) //playing priority order

    //fight
    for (thisMarble of order){ //does not deal with a possible victory yet, which would stop the loop
      if (thisMarble.isAlive()){
        thisMarble.savedAction.action(thisMarble.savedAction.targets)
      }
    }
    
    //nextPhase
    this.setupPhase()
  }

  setupPhase(){
    this.charactersAlive = [].concat(this.party.front, this.party.back).filter(x => x==null ? False : x.HP.current>0)
    this.characterIndex = 0
  }

  attackSelection(attackMethod){
    this.charactersAlive[characterIndex].savedAction.action = attackMethod
    //being able to click on targets if needed
  }

  targetSelection(target){
    this.charactersAlive[characterIndex].savedAction.targets.push(target)
  }
}


/*====================================================================================================*/





// Collections = {
//   Users:Meteor.users,
//   Areas:Areas,
//   Quests:Quests,
//   Parties:Parties,
//   Classes:Classes,
//   Skills:Skills,
//   Items:Items,
//   Statuses:Statuses,
//   Characters:Characters,
//   Monsters:Monsters
// }
//
// Marble = class Marble{
//   constructor(stats, spirit){
//     this.stats = stats
//     if(spirit){
//       this.spirit = spirit
//     }
//     Object.defineProperties(this, {
//       str:{
//         get(){
//           return {
//             value: this.stats.str,
//             level: Math.round((15.4*this.stats.str)/(this.stats.str+12))
//           }
//         },
//         set(newVal){
//           Meteor.call('updateChar', this.id, {$set:{'stats.str': newVal}}, (err, res)=>{
//             if(err){
//               console.log(err)
//             }
//           })
//           return this.str
//         }
//       }
//     })
//   }
//   armor(){
//     var armor = {
//       from: {},
//       get total(){
//         return Object.values(this.from).reduce((a,b)=>a+b, 0)
//       }
//     }
//     this.equipment.map(item=>{
//       armor.from[item.id] = item.stats.armor
//     })
//     return armor
//   }
//   criticalChance(){
//     var critChance = {
//       from: {},
//       get total(){
//         console.log(this)
//         return Object.values(this.from).reduce((a,b)=>a+b, 0)
//       }
//     }
//     this.equipment.map(item=>{
//       critChance.from[item.id] = item.stats.criticalChance
//     })
//     return critChance
//   }
// }

// Party = class Party{
//   constructor(idORlist){
//     var data = typeof idORlist == 'string' ? Parties.findOne(idORlist) : idORlist
//     if(typeof idORlist == 'string'){
//       this.id = data._id
//       Tools.extend(this, data, ['name', 'mode'])
//       this.location = {area:new Area(data.location.area), x:data.location.x, y:data.location.y, z:data.location.z}
//       this.leader = new Character(data.leader)
//     }
//     this.front = data.front
//     Object.entries(this.front).map(([spot,charId])=>this.front[spot]=typeof idORlist == 'string' ? new Character(charId) : new Monster(charId))
//     this.back = data.back
//     Object.entries(this.back).map(([spot,charId])=>this.back[spot]=typeof idORlist == 'string' ? new Character(charId) : new Monster(charId))
//   }
// }

// Marble = class Marble{
//   constructor(char, spiritID){
//     Tools.extend(this, char)
//     if(spiritID){
//       this.spirit = Game.spirits.find(a=>a.id==spiritID) || null
//     }
//   }
// }

// Character = class Character extends Marble{
//   constructor(id, spiritID){
//     var data = Characters.findOne(id)
//     var char = Tools.extend({}, data, ['name', 'gender', 'experience', 'colors', 'gold', 'stats'])
//     char.id = data._id
//     char.class = Classes.findOne(data.class)
//     char.equimpent = data.equipment.map(a=>Items.findOne(a))
//     char.inventory = data.inventory.map(a=>Items.findOne(a))
//     super(char, spiritID)
//   }
// }

// Character = class Character extends Marble{
//   constructor(id, spirit){
//     var data = Characters.findOne(id)
//     super(data.stats, spirit)
//     this.id = data._id
//     Tools.extend(this, data, ['name', 'gender', 'experience', 'colors', 'gold', 'summit'])
//     this.class = new Class(data.class)
//     this.equipment = data.equipment.map(a=>Items.findOne(a))
//     this.inventory = data.inventory.map(a=>Items.findOne(a))
//   }
// }

// Monster = class Monster extends Marble{
//   constructor(id, spirit){
//     var data = Monsters.findOne(id)
//     super(data.stats, spirit)
//     this.id = data._id
//     Tools.extend(this, data, ['name', 'description', 'skills', 'rewards'])
//   }
// }

Class = class Class{
  constructor(id){
    var data = Classes.findOne(id)
    this.id = data._id
    Tools.extend(this, data, ['name', 'description', 'layers'])
  }
}

Skill = class Skill{
  constructor(id){
    var data = Skills.findOne(id)
    this.id = data._id
    Tools.extend(this, data, ['name', 'description'])
  }
}

Item = class Item{
  constructor(id){
    var data = Items.findOne(id)
    this.id = data._id
    Tools.extend(this, data, ['name', 'description'])
  }
}

Status = class Status{
  constructor(id){
    var data = Statuses.findOne(id)
    this.id = data._id
    Tools.extend(this, data, ['name', 'description'])
  }
}

Area = class Area{
  constructor(id){
    var data = Areas.findOne(id)
    this.id = data._id
    Tools.extend(this, data, ['name', 'description', 'background'])
    if(data.subs){
      this.subs = data.subs.map(a=>new Area(a))
    }
  }
}

// Combat = class Combat{
//   constructor(){
//     this.init()
//   }
//   init(){
//     Game.layoutUI('combat')
//   }
// }

Horde = class Horde{
  constructor(area, enemies = {}){
    if(enemies.minions){
      // use provided enemies
    }else{
      // get some enemies based on area spawnrates
    }
    if(enemies.boss){
      // it's a big encounter
    }
  }
}

Effect = class Effect{
  constructor(name, targets, duration, init, step){
    this.id = 
    this.name = name
    this.targets = targets// Might need to do some logic to turn 'self' into whoever cast it, or, simply pass that in... Not sure about multi-target
    this.duration = duration
    this.init = ()=>{
      init()
      this.step()
    }
    this.step = ()=>{
      if(this.duration === 0){
        //remove
      }else{
        this.duration--
        step()
      }
    }
  }
}


var schemas = {
  class: `{
    id: <MeteorID>,
    name: String,
    description: String,
    archetype: String,
    proficiencies: {
      weapons: [
        (String | to match with the sub of an item),
        ...
      ],
      armor: {
        head: [
          (String | to match with the sub of an item),
          ...
        ]
        body: [
          (String | to match with the sub of an item),
          ...
        ],
        arms: [
          (String | to match with the sub of an item),
          ...
        ]
      }
    }
    skills: {
      (Number | Level obtained): [
        <SkillID>,
        ...
      ],
      ...
    }
  }`,
  skill: `{
    id: <MeteorID>,
    name: String,
    targets: String,
    duration: Number,
    phase: (String | Represents what phase of combat to be activated on),
    effect(caster, targets, info){
      // Do stuff
    }
  }`,
  item: `{
    id: <MeteorID>,
    type: (String | either weapon, accessory, or the body part),
    sub: String,
    price: {
      buy: function(){
        // Buy price - leader's haggle
      }(),
      sell: function(){
        // Sell price + leader's haggle
      }(),
    },
    effect(caster, targets, info){
      // Do stuff
    }
    stats:{
      (String | stat to affect): (Number | how much to affect it),
      ...
    }
  }`,
  status: `{
    id: <MeteorID>,
    name: String,
    duration: Number,
    phase: (String | Represents what phase of combat to be activated on),
    effect(caster, targets, info){
      // Do stuff
    }
  }`,
  party: `{
    id: <MeteorID>,
    name: String,
    location: {
      area: <AreaID>,
      sub: String || {x: Number, y: Number}
    },
    leader: <CharacterID>,
    front: {
      (Int | Row slot): <CharacterID>,
      ...
    },
    back: {
      (Int | Row slot): <CharacterID>,
      ...
    },
    creator: <UserID>,
    mode: (String | Gamemode they're currently in... Not sure I want this),
    quests: {
      <QuestID>: (String | Quest status)
    }
  }`,
  character: `{
    id: <MeteorID>,
    name: String,
    class: <ClassID>,
    colors: {
      (String | the color's part): (Color | Hex code),
      ...
    }
    stats: {
      str: {
        value: Number,
        level(){
          switch(true){
            case this.value <= 3:
            return Math.floor(stat/1+1)
            case this.value <= 10:
            return Math.floor(stat/2+2.5)
            case this.value <= 16:
            return Math.floor(stat/3+4)
            case this.value <= 20:
            return Math.floor(stat/5+6)
          }
        }
      },
      (... | Same for other stats)
    },
    attributes: [
      (String | attribute handler function),
      ...
    ],
    gold: Number
    equipment: [
      <ItemID>,
      ...
    ]
    inventory: [
      <ItemID>,
      ...
    ]
  }`,
  Area:`{
    id: <MeteorID>,
    name: String,
    description: String,
    background: (String | Url to img),
    subs: [
      <AreaID>,
      ...
    ]
  }`
}
}