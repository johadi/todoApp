/**
 * Created by ILYASANATE on 23/03/2017.
 */
//const MongoClient=require('mongodb').MongoClient;
const {MongoClient,ObjectId}=require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
    if(err) return console.error('could not connect to database');

    console.log('Connected to database successfully');

    db.collection('todo').deleteMany({name: 'jimoh'}).then((result)=>{
        console.log(result);
    }).catch((err)=>{
        console.log(err);
    });
    //deleteOne()
    //findOneAndDelete()
    db.close();
});