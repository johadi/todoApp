/**
 * Created by ILYASANATE on 24/03/2017.
 */
const request=require('supertest');
const expect=require('expect');
const {ObjectID}=require('mongodb');

var {app}=require('./../server');
var {Todo}=require('./../models/todo');

const todos=[{_id: new ObjectID,text: "todo text one"},
    {_id: new ObjectID,text: 'todo text two'}];
beforeEach((done)=>{
    Todo.remove({})
        .then(()=>{
            return Todo.insertMany(todos);
        }).then(()=>done());
});

describe('POST /todos',()=>{
    it('should create a new ToDo',(done)=>{
        var text='node is super';
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err,res)=>{
                if(err) return done(err);
                Todo.find({text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(()=>done(err));
            });
    });
    it('should not create todo with bad data',(done)=>{
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res)=>{
                if(err) return done(err);
                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(2);
                    done();
                }).catch(()=>done(err));
            });
    });
})

describe('GET /todos',()=>{
   it('get all the data',(done)=>{
       request(app)
           .get('/todos')
           .expect(200)
           .expect((res)=>{
               expect(res.body.todos.length).toBe(2);
           })
           .end(done);
   });
});
describe('GET /todos/:id',()=>{
    it('should return a todos with id',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done)
    });
    it('it should return 404 if valid ID not found',(done)=>{
        var hexID=new ObjectID().toHexString();
        request(app)
        .get(`/todos/${hexID}`)
        .expect(404)
        .end(done)
    });
    it('it should return 404 if ID not valid',(done)=>{
        request(app)
            .get(`/todos/1234`)
            .expect(404)
            .end(done)
    });
})
