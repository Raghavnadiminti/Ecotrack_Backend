const express=require("express") 
const mongoose=require("mongoose") 
const cors=require('cors')
const {server,app}=require('./sockets')
const {request_locations}=require('./functions')
const socket=require('socket.io')
const http=require('http')
const {locations,user_login_coll,admin_login_coll,collector_login_coll}=require('./models')





app.post('/users-request',async (req,res)=>{
  
        const {username,email,u_lon,u_lat}=req.query;
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
                await collector.save();
              
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

server.listen(5000,()=>{console.log("listening")})