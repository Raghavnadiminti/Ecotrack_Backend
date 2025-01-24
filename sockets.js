const express=require('express') 
const socket=require('socket.io')
const http=require('http')
const cors=require('cors')
const {locations,collectors_data}=require('./models.js')
const {request_locations,getDistance}=require('./functions.js')




app=express();
const server=http.createServer(app);
app.use(express.json())
app.use(cors({
       origin:'*',
       method:['GET','POST'],
       allowheaders:['content-type'],
       credentials:true
}))

const io=socket(server,{cors:{
    origin:'*',
    method:['GET','POST'],
    allowheaders:['content-type'],
    credentials:true
}});


const collector_location_socket=io.of('/location')
const UWC_socket=io.of('/collector-waste-confirm')
const req_pend=io.of('/req_pend')






//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
collector_location_socket.on('connection',(socket)=>{
   
   
      socket.emit('req_loc',{req:true})

      socket.on('collector_join',({id})=>{
            collector_loc_socketid[id]=socket.id;
      })
      socket.on('user_join',({username})=>{
              user_loc[username]=socket.id;
      })

      socket.on('user_location_info',async (user_loc)=>{
                 const {city,id_,lat1,lon1}=location_info;
                 const k=await locations.findOne({City:'city'}) 
                 

      })

      socket.on('getlocations',async (location_info)=>{
      
        const {id_,lat1,lon1}=location_info;
         const k=await locations.findOne({City:'vksp'})       
         if(k){
             try{   
            
              let collector=await k.collectors.find(col=>col.id==id_) 

                if(collector){
                    collector.lat=lat1;
                    collector.lon=lon1;
                }                
                else{

                  k.collectors.push({
                    id: id_,
                    lat: lat1,
                    lon: lon1
                });

                } 
              await  k.save(); 
               }
              catch(e){console.log(e)}                          
         }
         else{

         let city = new locations({
            City:'vksp',
            collectors: [{
                id: id_,
                lat: lat1,
                lon: lon1
            }]
        });
      await  city.save();
         }
          
      }) 

     

  
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const collector_loc_socketid={}
const collector_loc={}
const user_loc={}
const collectors_ll={}
UWC_socket.on('connection',(socket)=>{

     

      socket.on('collector_join',({id})=>{
        console.log(id,"collector joined")
           collectors_ll[id]=socket.id                        
      })

      socket.on('user_join',({username})=>{
        console.log("user joined",username)
             user_loc[username]=socket.id;
      })

      socket.on('user_req',({username,collectorid,weight})=>{
        console.log(username,collectorid,weight)
        const collector= collectors_ll[collectorid];
        console.log(collectors_ll)
        if(collector){   

           console.log("available",collector)
            UWC_socket.to(collector).emit('waste_update',{username:username,weight:weight}) 
            
        }
      })
      socket.on('req_confoirm',async ({collectorid,username})=>{
        const collector= collectors_ll[collectorid]; 
        try{
        await collectors_data.updateOne({id:collectorid},{$pull:{pending:{username}}})}
        catch(err){
          console.log(err)
        }

      })

      socket.on('get_location_collector',({id,lat,lan})=>{
        console.log("get_location_collectior",id,lat,lan)
                 collector_loc[id]={lat,lan}
      })


      socket.on('give_collector_loc',({id,username})=>{

        console.log("give_collector",id,username)
        let user=user_loc[username]
        if(user){
          console.log(collector_loc[id])
        UWC_socket.to(user).emit('collector_loc',{location:collector_loc[id]})
        }
         
      })


      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
     
        Object.keys(collectors_ll).forEach((collectorid) => {
            if (collectors_ll[collectorid] === socket.id) {
                console.log(`Collector ${collectorid} disconnected.`);
                delete collectors_ll[collectorid];
            }
        });

        Object.keys(user_loc).forEach((username) => {
            if (user_loc[username] === socket.id) {
                console.log(`User ${username} disconnected.`);
                delete user_loc[username];
            }
        });
    });

})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let collectors={}
let users={}

var location={}
let pres=0
let req={}

req_pend.on('connection',(socket)=>{
          
           

           socket.on('user_join',({username})=>{
            
               users[username]=socket.id;
               
                                      
          })


           socket.on('collector_join',({id,city})=>{
        
               collectors[id]=socket.id 
               if(!location[city]){
                location[city]=[id]
               }
               else{
                location[city].push(id)
               }      
               req_pend.to(socket.id).emit('joined',{req:req})                            
          })
         
         socket.on('user_req',({username,loc,cords})=>{
               pres+=1
               req[username]={id:pres,location:loc,cords}
               console.log("user requested",username,loc,location,cords)
               let flag=false
               Object.entries(location).forEach(([key,value])=>{
                    if(key==loc){
                      let m=value 
                      for(let j of m){
                          let collector=collectors[j]
                          flag=true
                          req_pend.to(collector).emit('requested',{id:pres,username:username,loc:loc,cords:cords})
                      }
                    }
               })

             if(!flag){                
              let user=users[username]
              req_pend.to(user).emit('accepted',{id:"collectors not available"})
        }               
         })

         socket.on('accept_req',async ({id,username})=>{

          let  collector=collectors[id]

          let user=users[username]

          console.log(id,username)
          
                        if(!req[username] && collector){
                            
                            req_pend.to(collector).emit('reqaccept',{req:false,msg:"already accepted"})
                        }
                       else{

                         if(user && collector){
                          let k=await collectors_data.findOne({id:id}).then(()=>{console.log("HI")}).catch((err)=>{console.log(err)})
                          console.log(k)
                          await collectors_data.findOneAndUpdate({id:id}, {$push:{pending:{username:username,reqId:pres}}}).then(()=>{console.log("HI")}).catch((err)=>{console.log(err)})

                        req_pend.to(user).emit('accepted',{id:id})
                        req_pend.to(collector).emit('reqaccept',{req:true,msg:"req accepted"})
                        delete req[username] 
                        pres=Math.max(0,pres-1) 
                         }

                       }
         })

         socket.on('disconnect', () => {
          for (let [username, socketId] of Object.entries(users)) {
            if (socketId === socket.id) {
              delete users[username];
              break;
            }
          }
        
          for (let [id, socketId] of Object.entries(collectors)) {
            if (socketId === socket.id) {
              delete collectors[id];
              for (let [city, ids] of Object.entries(location)) {
                location[city] = ids.filter(collectorId => collectorId !== id);
              }
              break;
            }
          }
        });


})







module.exports={server,app}