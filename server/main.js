import { Meteor } from 'meteor/meteor'
import fs from 'fs'
import '/lib/collections'

const path = require('path').resolve('.').split('.meteor')[0]

Meteor.methods({
  signUp(userInfo){
    return Accounts.createUser(userInfo)
  },
  readAssets(assetPicker){
    var dirs = {files:[]}
    function readDir(dir){
      var target = dirs
      for(var i=1;i<dir.split('/').length;i++){
        if(target[dir.split('/')[i]]){
          target = target[dir.split('/')[i]]
        }
      }
      for(var item of fs.readdirSync(path+dir)){
        if(fs.lstatSync(`${path}${dir}/${item}`).isDirectory()){
          target[item] = {files:[]}
          readDir(`${dir}/${item}`)
        }else{
          if(/\.(gif|jpe?g|tiff?|png|webp|bmp)$/i.test(item) && assetPicker.some((a)=>dir.includes(a))){
            target.files.push(item)
          }
        }
      }
    }
    readDir('public')
    return dirs
  },
  setParty(partyID){
    if(Parties.findOne(partyID)){
      if(Parties.findOne(partyID).creator == Meteor.userId()){
        Meteor.users.update(Meteor.userId(), {$set:{party:partyID}})
      }else{
        throw new Meteor.Error('303', 'Party not owned by user.')
      }
    }else{
      throw new Meteor.Error('404', 'Party not found.')
    }
  },
  updateChar(id, changesList){
    var char = Characters.findOne(id)
    Object.entries(changesList).map(([method, changes])=>{
      // define actions and requirements
    })
  }
})

Meteor.publish('user', ()=>Meteor.users.find(Meteor.userId(),{
  fields:{
    username: 1,
    party: 1,
    data: 1
  }
}))

Meteor.publish('users', ()=>Meteor.users.find({$or:[{deactivated:{$exists:false}},{deactivated:false}]},{
  sort:{
    username:1
  },
  fields:{
    username:1
  }
}))

Meteor.publish('areas', ()=>Areas.find({},{
  fields:{
    name: 1,
    description: 1,
    subs: 1,
    mode: 1
  }
}))

Meteor.publish('quests', ()=>Quests.find({},{
  fields:{
    name: 1
  }
}))

Meteor.publish('parties', ()=>Parties.find({creator:Meteor.userId()},{
  fields:{
    name: 1,
    mode: 1,
    location: 1,
    leader: 1,
    front: 1,
    back: 1,
    quests: 1
  }
}))

Meteor.publish('characters', ()=>Characters.find({creator:Meteor.userId()},{
  fields:{
    name: 1,
    gender: 1,
    experience: 1,
    class: 1,
    colors: 1,
    gold: 1,
    equipment: 1,
    inventory: 1,
    stats: 1
  }
}))

Meteor.publish('classes', ()=>Classes.find({},{
  fields:{
    name: 1,
    description: 1,
    layers: 1,
    archetype: 1,
    proficiencies: 1,
    skills: 1
  }
}))

Meteor.publish('skills', ()=>Skills.find({},{
  fields:{
    name:1,
    description: 1,
    duration: 1,
    target: 1,
    phase: 1,
    effect: 1
  }
}))

Meteor.publish('monsters', ()=>Monsters.find({},{
  fields:{
    name:1,
    description: 1,
    texture: 1,
    skills: 1,
    rewards: 1
  }
}))

Meteor.publish('items', ()=>Items.find({},{
  fields:{
    name: 1,
    description: 1,
    type: 1,
    sub: 1,
    price: 1,
    uses: 1,
    duration: 1,
    target: 1,
    phase: 1,
    effect: 1,
    attack: 1
  }
}))

Meteor.publish('statuses', ()=>Statuses.find({},{
  fields:{
    name: 1,
    description: 1,
    duration: 1,
    target: 1,
    phase: 1,
    effect: 1
  }
}))
