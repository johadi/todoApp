//const MongoClient=require('mongodb').MongoClient;
const {MongoClient,ObjectID}=require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
    if(err) return console.error('could not connect to database');
    console.log('Connected to database successfully');

    db.collection('todo').find().toArray()
        .then((doc)=>{
        console.log(JSON.stringify(doc,undefined,2));
        })
        .catch((err)=>{
        console.log(err);
        });
    db.collection('todo').find().count()
        .then((count)=>{
            console.log(count);
        })
        .catch((err)=>{
            console.log(err);
        });
    db.close();
});
