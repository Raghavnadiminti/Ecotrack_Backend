const mongoose=require("mongoose") 

mongoose.connect('mongodb://localhost:27017/') 

const collectors_scheema=mongoose.Schema({
    id:String,
    lat:String,
    lon:String
})

const scheema=mongoose.Schema({
      City:String,
      collectors:[collectors_scheema]
      
})

const locations=mongoose.model('location',scheema) 

module.exports={locations}

