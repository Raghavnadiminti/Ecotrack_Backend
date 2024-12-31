const express=require('express') 
const socket=require('socket.io')
const http=require('http')
const cors=require('cors')
const {locations}=require('./models.js')
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


const location_socket=io.of('/location')
const UWC_socket=io.of('/collector-waste-confirm')




location_socket.on('connection',(socket)=>{
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

      socket.on('disconnect',()=>{
        Object.keys(collectors).forEach((collectorid)=>{  
           
             if(collectors[collectorid]==socket.id){
                delete collectors[collectorid] 
             }

        })
      })

})










module.exports={server,app}