const express=require("express") 
const mongoose=require("mongoose") 
const cors=require('cors')
const {request_locations,server,app}=require('./Locations')
const socket=require('socket.io')
const http=require('http')






app.post('/users-request',async (req,res)=>{
  
        const {username,email,u_lon,u_lat}=req.query;
        console.log(req.body)
        console.log(username,email,u_lon,u_lat)
        let near_user;
       let user= await request_locations('vksp',u_lon,u_lat,(id)=>{near_user=id})


        res.send({near:near_user}) 
})




server.listen(5000,()=>{console.log("listening")})