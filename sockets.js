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




collector_location_socket.on('connection',(socket)=>{
    console.log("client connected")
   
      socket.emit('req_loc',{req:true})

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


UWC_socket.on('connection',(socket)=>{

      const collectors={}

      socket.on('collector_join',(id)=>{
        console.log(id)
           collectors[id]=socket.id                        
      })

      socket.on('user_req',({username,collectorid,weight})=>{
        console.log(username,collectorid,weight)
        const collector= collectors[collectorid];
        console.log(collectors)
        if(collector){   

           console.log("available",collector)
            UWC_socket.to(collector).emit('waste_update',{username:username,weight:weight}) 
            
        }
      })
      socket.on('req_confoirm',async ({collectorid,username})=>{
        const collector= collectors[collectorid]; 
        await collectors_data.updateOne({id:collectorid},{$pull:{pending:{username}}})

      })

      socket.on('disconnect',()=>{
        Object.keys(collectors).forEach((collectorid)=>{  
           
             if(collectors[collectorid]==socket.id){
                delete collectors[collectorid] 
             }

        })
      })

})
let collectors={}
let users={}

var location={}
let pres=0
let req={}

req_pend.on('connection',(socket)=>{
          
           

           socket.on('user_join',({username})=>{
               console.log(username)
               users[username]=socket.id;
                                      
          })


           socket.on('collector_join',({id,city})=>{
            console.log(id)
               collectors[id]=socket.id 
               if(!location[city]){
                location[city]=[id]
               }
               else{
                location[city].push(id)
               }
                   console.log(location)                   
          })
         
         socket.on('user_req',({username,loc})=>{
               pres+=1
               req[username]=pres
               console.log("user requested",username,loc,location)
               Object.entries(location).forEach(([key,value])=>{
                    if(key==loc){
                      let m=value 
                      for(let j of m){
                          let collector=collectors[j]
                          req_pend.to(collector).emit('requested',{username:username,loc:loc})
                      }
                    }
               })
         })

         socket.on('accept_req',async ({id,username})=>{
          let  collector=collectors[id]
          let user=users[username]
                        if(!req[username] && collector){
                            
                            req_pend.to(collector).emit('reqaccept',{req:false,msg:"already accepted"})
                        }
                       else{
                         if(user && collector){
                          await collectors_data.updateOne({id:id}, {$push:{pending:{username}}})
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