const express=require('express') 
const socket=require('socket.io')
const http=require('http')
const cors=require('cors')
const {locations}=require('./models.js')

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


io.on('connection',(socket)=>{
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


async function request_locations(city,lat2,lon2,callback){
   
    let min=99999999999999;
    let id_=-1;
    const k=await locations.findOne({City:'vksp'})
   
    if(k){
    let locations=k.collectors;
    locations.forEach((collector,index)=>{
          
        const {id,lat,lon}=collector;
          console.log(collector)
        let dis=getDistance(lat,lon,lat2,lon2);

        console.log(dis)

         if(dis<=min){
          min=dis;
          id_=id;
         }
    })
   
    callback(id_);
  }
  else{
     callback("not ok")
  }

    }



function getDistance(lat1, lon1, lat2, lon2) { const R = 6371; 
  
  lat1=parseFloat(lat1)
  lon1=parseFloat(lon1)
  lat2=parseFloat(lat2)
  lon2=parseFloat(lon2) 
 
const dLat = (lat2 - lat1) * Math.PI / 180; 
const dLon = (lon2 - lon1) * Math.PI / 180; 
const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
const distance = R * c; 
return distance;
}



module.exports={ request_locations,server,app}