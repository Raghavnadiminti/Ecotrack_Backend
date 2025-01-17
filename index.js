const express=require("express") 
const mongoose=require("mongoose") 
const cors=require('cors')
const {server,app}=require('./sockets')
const {request_locations}=require('./functions')
const socket=require('socket.io')
const http=require('http')
const {locations,user_login_coll,admin_login_coll,collector_login_coll, collectors_data}=require('./models')



app.post('/users-request',async (req,res)=>{
  
        const {username,email,u_lon,u_lat}=req.body;
        console.log(req.body)
        console.log(username,email,u_lon,u_lat)
        let near_user;
       let user= await request_locations('vksp',u_lon,u_lat,(id)=>{near_user=id})


        res.send({near:near_user}) 
})

app.post('/user-login',async (req,res)=>{

          const {username,password}=req.query;
          let k = await user_login_coll.findOne({username:username,password:password}) 
          if(k){
                res.send(true)
          }
          else{
                res.send(false)
          }
})
app.post('/admin-login',async (req,res)=>{

        const {id,username,password}=req.body;
        let k = await admin_login_coll.findOne({id:id,username:username,password:password}) 
        if(k){
              res.send(true)
        }
        else{
              res.send(false)
        }
})
app.post('/collector-login',async (req,res)=>{

        const {id,username,password}=req.body;
        let k = await collector_login_coll.findOne({id:id,username:username,password:password}) 
        if(k){
              res.send(true)
        }
        else{
              res.send(false)
        }
})
app.post('/user-register',async (req,res)=>{
        const {email,username,password}=req.query;
        let k = await user_login_coll.findOne({username:username}) 
        if(k){
              res.send(false)
        }
        else{
                let user=new user_login_coll({email:email,username:username,password:password})
                await user.save();
              
                res.send(true)
        }


})
app.post('/collector-register',async (req,res)=>{
        const {email,username,password,id}=req.body;
        let k = await collector_login_coll.findOne({username:username}) 
        if(k){
              res.send(false)
        }
        else{
                let collector=new collector_login_coll({email:email,id:id,username:username,password:password})
                let collecto=new collectors_data({id:id,lat:null,lon:null,pending:[]})
                await collector.save();
                await collecto.save()
                res.send(true)
        }


})
app.post('/admin-register',async (req,res)=>{
        const {email,username,password}=req.body;
        let k = await admin_login_coll.findOne({username:username}) 
        if(k){
              res.send(false)
        }
        else{
                let admin=new admin_login_coll({email:email,username:username,password:password})
                await admin.save();
              
                res.send(true)
        }
})

const port=process.env.PORT
server.listen(port,()=>{console.log("listening")})