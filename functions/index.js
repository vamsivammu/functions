
const functions = require('firebase-functions');
const admin=require('firebase-admin')
var serviceAccount = require("./melango-5b3ee-firebase-adminsdk-wiaf6-8707c45146.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://melango-5b3ee.firebaseio.com"
});
var devicetokens2,devicetokens1
var msg
var name
let db = admin.database()
// exports.sendnotification=functions.database.ref('/chats/{uid1}/{uid2}/{newnode}').onCreate((snapshot,context)=>{
//     const uid1=context.params.uid1
//     const uid2=context.params.uid2
//     data=snapshot.val()
//     if(data.direction!="from"){
//         return
//     }
//     if(data.direction==="from"){
//         msg=data.msg
//         console.log(msg)
//         admin.database().ref('users').child(uid2).child('data').child('first_name').once('value').then(res=>{
//             name=res.val()
//             console.log(name)
//         }).then(()=>{
//             admin.database().ref('users').child(uid1).child('data').child('devicetokens').once('value').then(res=>{
//                 devicetokens=res.val()
//                 console.log(devicetokens)
//             }).then(()=>{
//                 const payload={
//                     notification:{
//                         title:name,
//                         body:msg
//                     }
//                 }
//                 admin.messaging().sendToDevice(devicetokens,payload).then((response)=>{
//                     console.log('successfully sent')
//                 }).catch(e=>{
//                     console.log("error sending msg:"+e)})
//             }).catch(e=>console.log(e))
//         }).catch(e=>console.log(e))
//     }
//     // console.log('1')
//     // const useruid=context.params.uid
//     // console.log(useruid)
//     // return admin.database().ref('profile').child(useruid).child('devicetokens').once('value').then(data=>{
//     //     devicetokens=data.val()
//     //     console.log(devicetokens)
  
//     // }).then(()=>{
//     //     const payload={
//     //         notification:{
//     //             title:"Melango",
//     //             body:"Hi"
//     //         }
//     //            }
//     //     console.log(devicetokens)
//     //     admin.messaging().sendToDevice(devicetokens,payload).then((response)=>{
//     //         console.log("Successfully sent")
//     //     }).catch(e=>{
//     //         console.log('error sednding message:'+e)
//     //     })
//     // }).catch(e=>{
//     //     console.log(e)
//     // })
// })
exports.match = functions.database.ref('/likesoffline/{uid}/{uid1}').onCreate(async(snap,cont)=>{

    let uid = cont.params.uid
    let uid1 = cont.params.uid1

    await db.ref('likedusersoffline').child(uid).child(uid1).once('value',async(r)=>{
        if(r.val()!=null){
          await db.ref('likedusersoffline').child(uid).child(uid1).remove().then(()=>{

          }).catch(e=>{

          })
          await db.ref('likedusersoffline').child(uid1).child(uid).remove().then(()=>{

          }).catch((e)=>{

          })
          await db.ref('likesoffline').child(uid).child(uid1).remove().then(()=>{

        }).catch(e=>{

        })
        await db.ref('likesoffline').child(uid1).child(uid).remove().then(()=>{

        }).catch((e)=>{

        })

        await db.ref('matchedusers').child(uid).child(uid1).child('data').set({
            'match':uid1
        }).catch(e=>{

        })
        await db.ref('matchedusers').child(uid1).child(uid).child('data').set({
            'match':uid
        }).catch(e=>{
            
        })

        admin.database().ref('users').child(uid1).child('data').child('devicetokens').once('value').then(res=>{
               devicetokens2=res.val()
                // console.log(devicetokens)
            }).then(()=>{
                const payload={
                    notification:{
                        title:'Congrats',
                        body:'You got a match'
                    }
                }
                admin.messaging().sendToDevice(devicetokens2,payload).then((response)=>{
                    console.log('successfully sent')
                }).catch(e=>{
                    console.log("error sending msg:"+e)
                })
            })
            admin.database().ref('users').child(uid).child('data').child('devicetokens').once('value').then(res=>{
              devicetokens1=res.val()
                // console.log(devicetokens)
            }).then(()=>{
                const payload={
                    notification:{
                        title:'Congrats',
                        body:'You got a match'
                    }
                }
                admin.messaging().sendToDevice(devicetokens1,payload).then((response)=>{
                    console.log('successfully sent')
                }).catch(e=>{
                    console.log("error sending msg:"+e)
                })
            })
        }
    })

})

exports.searching = functions.database.ref('/searching/{uid}').onCreate(async(snap,cont)=>{
    let uid = cont.params.uid

})

exports.online = functions.database.ref('/users/{uid}/data/onlinestatus').onUpdate(async(snapshot,context)=>{

    var uid = context.params.uid
    console.log(uid)
    var curstatus = snapshot.after.val()
    var befstatus = snapshot.before.val()
    console.log(curstatus,befstatus)
    if(curstatus=="offline"){
       await db.ref('online').child(uid).remove()
        await db.ref('users').child(uid).child('data').once('value',async(r)=>{
                let beffstatus = r.val()['status']
                console.log(beffstatus)
                
                let connectedto = r.val()['connectedto']

                if(beffstatus=="searching" || beffstatus=="listening"){
                    await db.ref(beffstatus).child(uid).remove()
                 }else if(beffstatus=="connected" && connectedto!='none'){
            await db.ref('users').child(connectedto).child('data').update({'connectedto':'none','status':'online'})
            
                 }
                 await db.ref('idlesearching').child(uid).remove().catch(e=>{})
                 await db.ref('idlelistening').child(uid).remove().catch(e=>{})
                 await db.ref('users').child(uid).child('data').update({'status':'offline','connectedto':'none'})
        })
       
    }else if(curstatus=="online"){
            if(befstatus=="offline"){
                await db.ref('users').child(uid).child('data').once('value').then(async(r)=>{
                    db.ref('online').child(uid).child('data').update({'email':r.val()['email'],'lat':r.val()['lat'],'longitude':r.val()['longitude'],'status':'online','uid':uid})
                    let numa = await db.ref('searching').once('value')
                    let numsearching =await numa.numChildren()
                    let numb = await db.ref('listening').once('value')
                    let numlistening = await numb.numChildren()
                    let assigned = numsearching>numlistening ? 'listening' : 'searching'
                    db.ref('users').child(uid).child('data').update({
                        status:assigned
                    })
                    db.ref(assigned).child(uid).set({'status':assigned})
                })
                
            }
    }
})

exports.connectusers = functions.database.ref('/users/{uid}/data/status').onUpdate(async(snap,cont)=>{
    let cur = snap.after.val()
    let pre = snap.before.val()
    let uid = cont.params.uid
    let connuid
    if(cur=="searching"){
       let l = await db.ref('idlelistening').once('value',async(a)=>{
        let b = await db.ref('users').child(uid).child('data').once('value')
        let lat = b.val()['lat']
        let longitude = b.val()['longitude']
        let gender = b.val()['gender']
        let interest = b.val()['interest']
        console.log(gender,interest)
         let found = false
        let i=0
        if(a.exists() && a.numChildren()>0){
            await a.forEach(async(e)=>{
                if(found){
                    console.log("found")
                    return true
                }else{
                    i = i+1
                let keyid = e.key
               let c =  await db.ref('users').child(keyid).child('data').once('value')
               let int = c.val()['interest']
               let gend = c.val()['gender']
               console.log(keyid)
               console.log(int,gend)
               let cond1 = interest!='Both' && interest==gend && int!='Both' && int==gender
               let cond2 = interest=='Both' && int!='Both' && int==gender
               let cond3 = interest!='Both' && interest==gend && int=='Both'
               let cond4 = interest=='Both' && int=='Both'
               console.log(cond1,cond2,cond3,cond4)
               if(cond1 || cond2 || cond3 ||cond4){
                 let e = await isthereinliked(uid,keyid).then(p=>{
                     return p.msg
                   })
                   
                   let f = await isthereinmatched(uid,keyid).then(p=>{
                     return p.msg
                   })
                   let g = await isover(uid,keyid).then(p=>{
                     return p.msg
                   })
                   console.log(e,f,g)
                   if(uid!=keyid){
                     if(!f && !g && !e){
                         connuid = keyid
                         found = true
                         await db.ref('idlelistening').child(connuid).remove().catch(e=>{})
                         await db.ref('listening').child(connuid).remove().catch(e=>{})
                         await db.ref('searching').child(uid).remove().catch(e=>{})
                         await db.ref('idlesearching').child(uid).remove().catch(e=>{})
                         await db.ref('users').child(uid).child('data').update({'status':'connected','connectedto':connuid}).catch(e=>{})
                         await db.ref('users').child(connuid).child('data').update({'status':'connected','connectedto':uid}).catch(e=>{})
                         await db.ref('overusers').child(uid).child(connuid).update({'over':'over'})
                         await db.ref('overusers').child(connuid).child(uid).update({'over':'over'})
                     }else{
                        if(i==a.numChildren()){
                            await db.ref('idlesearching').child(uid).set({'status':'idle'})
                        }
                     }
                   }
               }else{
                   console.log("not there")
                if(i==a.numChildren()){
                    await db.ref('idlesearching').child(uid).set({'status':'idle'})
                }
               }
             }
    

               
           })
        }else{
            await db.ref('idlesearching').child(uid).set({'status':'idle'})
        }
     

    
       })
       
    }
    else if(cur=="online"){
        let a =await db.ref('users').child(uid).child('data').once('value')
        let conn = a.val()['connectedto']
        if(conn!='none'){
            await db.ref('users').child(conn).child('data').update({'status':'online','connectedto':'none'})    
        }
        let numa = await db.ref('searching').once('value')
        let numsearching =await numa.numChildren()
        let numb = await db.ref('listening').once('value')
        let numlistening = await numb.numChildren()
        let assigned = numsearching>numlistening ? 'listening' : 'searching'
        await db.ref(assigned).child(uid).set({'status':assigned})
        await db.ref('users').child(uid).child('data').update({
                status:assigned,
                connectedto:'none'
        })

    }else if(cur=="listening"){
        let l = await db.ref('idlesearching').once('value',async(a)=>{
            let b = await db.ref('users').child(uid).child('data').once('value')
            let lat = b.val()['lat']
            let longitude = b.val()['longitude']
            let gender = b.val()['gender']
            let interest = b.val()['interest']
            console.log(gender,interest)
             let found = false
            let i=0
            if(a.exists() && a.numChildren()>0){
                await a.forEach(async(e)=>{
                    if(found){
                        console.log("found")
                        return true
                    }else{
                        i = i+1
                    let keyid = e.key
                   let c =  await db.ref('users').child(keyid).child('data').once('value')
                   let int = c.val()['interest']
                   let gend = c.val()['gender']
                   console.log(keyid)
                   console.log(int,gend)
                   let cond1 = interest!='Both' && interest==gend && int!='Both' && int==gender
                   let cond2 = interest=='Both' && int!='Both' && int==gender
                   let cond3 = interest!='Both' && interest==gend && int=='Both'
                   let cond4 = interest=='Both' && int=='Both'
                   console.log(cond1,cond2,cond3,cond4)
                   if(cond1 || cond2 || cond3 ||cond4){
                     let e = await isthereinliked(uid,keyid).then(p=>{
                         return p.msg
                       })
                       
                       let f = await isthereinmatched(uid,keyid).then(p=>{
                         return p.msg
                       })
                       let g = await isover(uid,keyid).then(p=>{
                         return p.msg
                       })
                       console.log(e,f,g)
                       if(uid!=keyid){
                         if(!f && !g && !e){
                             connuid = keyid
                             found = true
                             await db.ref('idlesearching').child(connuid).remove().catch(e=>{})
                             await db.ref('searching').child(connuid).remove().catch(e=>{})
                             await db.ref('listening').child(uid).remove().catch(e=>{})
                             await db.ref('idlelistening').child(uid).remove().catch(e=>{})
                             await db.ref('users').child(uid).child('data').update({'status':'connected','connectedto':connuid}).catch(e=>{})
                             await db.ref('users').child(connuid).child('data').update({'status':'connected','connectedto':uid}).catch(e=>{})
                             await db.ref('overusers').child(uid).child(connuid).update({'over':'over'}).catch(e=>{})
                             await db.ref('overusers').child(connuid).child(uid).update({'over':'over'}).catch(e=>{})
    
                         }else{
                            if(i==a.numChildren()){
                                await db.ref('idlelistening').child(uid).set({'status':'idle'})
                            }
                         }
                       }
                   }else{
                       console.log("not there")
                    if(i==a.numChildren()){
                        await db.ref('idlelistening').child(uid).set({'status':'idle'})
                    }
                   }
                 }
        
    
                   
               })
            }else{
                await db.ref('idlelistening').child(uid).set({'status':'idle'})
            }
         
    
        
           })
    }
    
})
async function isthereinmatched(uid1,uid2){
    let a
      await db.ref(`matchedusers/${uid1}/${uid2}`).once('value',async(r)=>{
        if(await r.val()!=null){
          a= true
        }else{
          a= false
        }
      })
      return {msg:a}
    }
    async function isthereinliked(uid1,uid2){
      let a
      await db.ref(`likedusers/${uid1}/${uid2}`).once('value',async(r)=>{
        if(await r.val()!=null){
          a= true
        }else{
          a= false
        }
      })
      return {msg:a}
    }
  async function isover(uid1,uid2){
    let a
    await db.ref(`overusers/${uid1}/${uid2}`).once('value',async(r)=>{
      if(await r.val()!=null){
        a= true
      }else{
        a= false
      }
    })
    return {msg:a}
  }
function calcdist(lat1,long1,lat2,long2){
    if(lat1==lat2 && long1==long2){
      return 0;
    }
    var radlat1 = Math.PI * lat1/180;
      var radlat2 = Math.PI * lat2/180;
      var theta = long1-long2;
      var radtheta = Math.PI * theta/180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180/Math.PI;
      dist = dist * 60 * 1.1515*1.61;
      dist=Math.round(dist)
    return dist
  }
exports.seen = functions.database.ref('/chats/{uid1}/{uid2}/{node}').onCreate(async(snap,cont)=>{
    let data = snap.val()
    let sender = data['sender']
    let rec = data['rec']
    // let otherkey = data['otherkey']
    let key = snap.key
    let dir = data['direction']
    console.log(data['msg'])
    if(dir=='sent'){
        let otherkey = data['otherkey']
        await db.ref('chats').child(rec).child(sender).child(otherkey).update({'otherkey':key})
        await db.ref('chats').child(rec).child(sender).child(otherkey).on('value',async(r)=>{
            let val = r.val()
            if(val['status']=="seen"){
                console.log('seen')
                console.log('details:',r.val())
                await db.ref('chats').child(r.val()['sender']).child(r.val()['rec']).child(r.val()['otherkey']).update({"direction":'seen'}).then(async(r1)=>{
                    await db.ref('chats').child(r.val()['rec']).child(r.val()['sender']).child(r.key).off('value')
                    
                  })
            }else{
                await db.ref('unseenmsgs').child(r.val()['rec']).child(r.val()['sender']).once('value',async(r3)=>{
                    console.log(r3.val())
                    let num
                    try{
                      num = r3.val()['num']
                    }catch(e){
                      num =0
                    }
                    await db.ref('unseenmsgs').child(rec).child(sender).update({'num':num+1})
                  })
            }
        })
    }    
})