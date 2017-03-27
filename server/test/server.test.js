/**
 * Created by ILYASANATE on 24/03/2017.
 */
const request=require('supertest');
const expect=require('expect');
const {ObjectID}=require('mongodb');
const {User}=require('./../models/user');

var {app}=require('./../server');
var {Todo}=require('./../models/todo');
var {populateTodos,todos,users,populateUsers}=require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

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
    it('it should return 404 if ID not ObjectId',(done)=>{
        request(app)
            .get(`/todos/1234`)
            .expect(404)
            .end(done)
    });
});

describe('/DELETE /todos/:id',()=>{
    it('should remove id from database',(done)=>{
        var hexId1=todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId1}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo._id).toBe(hexId1)
            })
            .end((err,res)=>{
                if(err) return done(err);
                Todo.findById(hexId1)
                    .then(todo=>{
                        expect(todo).toNotExist();
                        done();
                    }).catch(err=>done(err));
            });
    });
    it('should return 404 if valid ID is not found',(done)=>{
        var hexID=new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(404)
            .end(done)
    });
    it('should return 404 if ID is not ObjectId',(done)=>{
        var hexID=new ObjectID().toHexString();
        request(app)
            .delete('/todos/23456')
            .expect(404)
            .end(done)
    });
});
describe('PATCH todos/:id',()=>{
   it('should update todo by id',(done)=>{
       var hexId=todos[0]._id.toHexString();
       var text='new patch update';
       request(app)
           .patch(`/todos/${hexId}`)
           .send({text,completed: true})
           .expect(200)
           .expect((res)=>{
               expect(res.body.todo.text).toBe(text);
               expect(res.body.todo.completed).toBe(true);
               expect(res.body.todo.completedAt).toBeA('number');
           })
           .end(done)
   });
    it('should clear updatedAt when todo is not completed',(done)=>{
        var hexId=todos[1]._id.toHexString();
        var text='this is new patch update 2';
        request(app)
            .patch(`/todos/${hexId}`)
            .send({text,completed: false})
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done)
    })
});
describe('GET /users/me',()=>{
    it('should return user if authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done)
    });
    it('should return 401 if not authenticated',(done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res)=>{
                expect(res.body).toEqual({});
            })
            .end(done)
    })
});
describe('POST /users',()=>{
    it('should create a user',(done)=>{
        var email='jim@yahoo.com';
        var password='123123';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(200)
            .expect((res)=>{
                expect(res.header['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end(err=>{
                if(err) return done(err);

                User.findOne({email}).then(user=>{
                    expect(user).toExist();
                    expect(user.password).toNotBe(password);
                    done();
                })
            })
    });
    it('should return validation error if request fail',(done)=>{
        var email='jimyahoo.com';
        var password='123123';
        request(app)
            .post('/users')
            .send({email,password})
            .expect(400)
            .end(done)
    });
    it('should not create user if email is in use',(done)=>{
        request(app)
            .post('/users')
            .send({email: users[0].email,password: users[0].password})
            .expect(400)
            .end(done)
    })
});
