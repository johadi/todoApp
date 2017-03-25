/**
 * Created by ILYASANATE on 24/03/2017.
 */
const mongoose=require('mongoose');

mongoose.Promise=global.Promise
mongoose.connect('mongodb://127.0.0.1:27017/TodoApp',(err)=>{
    if(err) return console.error(err);
    console.log('database connected successfully');
});
module.exports={mongoose};