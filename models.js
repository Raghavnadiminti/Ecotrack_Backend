const mongoose=require("mongoose") 

mongoose.connect('mongodb://localhost:27017/') 

const collectors_scheema=mongoose.Schema({
    id:String,
    lat:String,
    lon:String,
    pending:[{
        username:String,
        loacation:String,
        reqId:Number,
    }],
    tripno:Number
})

const location_scheema=mongoose.Schema({
      City:String,
      collectors:[collectors_scheema]
      
})

const collector_login_scheema=mongoose.Schema({
    id:String,
    username:String,
    password:String
})

const user_login_scheema=mongoose.Schema({
    email:String,
    username:String,
    password:String,
})

const admin_login_scheema=mongoose.Schema({
    id:String,
    username:String,
    password:String
})

const user_login_coll=mongoose.model('user_login',user_login_scheema)
const admin_login_coll=mongoose.model('admin_login',admin_login_scheema)
const collector_login_coll=mongoose.model('collector_login',collector_login_scheema)
const collectors_data=mongoose.model('collectors',collectors_scheema)
const locations=mongoose.model('location',location_scheema) 

module.exports={locations,user_login_coll,admin_login_coll,collector_login_coll,collectors_data}

