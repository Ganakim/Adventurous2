//this is a test

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

Collections = {
  Users:Meteor.users,
  Areas:Areas,
  Quests:Quests,
  Parties:Parties,
  Classes:Classes,
  Skills:Skills,
  Items:Items,
  Statuses:Statuses,
  Characters:Characters,
  Monsters:Monsters
}

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

Party = class Party{
  constructor(idORlist){
    var data = typeof idORlist == 'string' ? Parties.findOne(idORlist) : idORlist
    if(typeof idORlist == 'string'){
      this.id = data._id
      Tools.extend(this, data, ['name', 'mode'])
      this.location = {area:new Area(data.location.area), x:data.location.x, y:data.location.y, z:data.location.z}
      this.leader = new Character(data.leader)
    }
    this.front = data.front
    Object.entries(this.front).map(([spot,charId])=>this.front[spot]=typeof idORlist == 'string' ? new Character(charId) : new Monster(charId))
    this.back = data.back
    Object.entries(this.back).map(([spot,charId])=>this.back[spot]=typeof idORlist == 'string' ? new Character(charId) : new Monster(charId))
  }
}

Marble = class Marble{
  constructor(char, spiritID){
    Tools.extend(this, char)
    if(spiritID){
      this.spirit = Game.spirits.find(a=>a.id==spiritID) || null
    }
  }
}

Character = class Character extends Marble{
  constructor(id, spiritID){
    var data = Characters.findOne(id)
    var char = Tools.extend({}, data, ['name', 'gender', 'experience', 'colors', 'gold', 'stats'])
    char.id = data._id
    char.class = Classes.findOne(data.class)
    char.equimpent = data.equipment.map(a=>Items.findOne(a))
    char.inventory = data.inventory.map(a=>Items.findOne(a))
    super(char, spiritID)
  }
}

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

Monster = class Monster extends Marble{
  constructor(id, spirit){
    var data = Monsters.findOne(id)
    super(data.stats, spirit)
    this.id = data._id
    Tools.extend(this, data, ['name', 'description', 'skills', 'rewards'])
  }
}

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

Combat = class Combat{
  constructor(){
    this.init()
  }
  init(){
    Game.layoutUI('combat')
  }
}

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