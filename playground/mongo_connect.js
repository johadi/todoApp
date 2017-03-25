//const MongoClient=require('mongodb').MongoClient;
const {MongoClient,ObjectId}=require('mongodb');
MongoClient.connect('mongodb://localhost:27017/TodoApp',(err,db)=>{
    if(err) return console.error('could not connect to database');

    console.log('Connected to database successfully');
    db.collection('todo').insertMany([{name: 'hadi',age: 45},{name: 'razak',age: 23},{name: 'seidu',age: 28}],(err,result)=>{
        if(err) return console.error(err);

        console.log(JSON.stringify(result.ops,undefined,2));
    });

    db.close();
});