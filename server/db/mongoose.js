/**
 * Created by ILYASANATE on 24/03/2017.
 */
const mongoose=require('mongoose');

mongoose.Promise=global.Promise
mongoose.connect(process.env.MONGODB_URI,(err)=>{
    if(err) return console.error(err);
    console.log('database connected' ,process.env.MONGODB_URI);
});
module.exports={mongoose};