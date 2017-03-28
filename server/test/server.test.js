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
    it('should create a new Todo',(done)=>{
        var text='node is super';
        request(app)
            .post('/todos')
            .set('x-auth',users[0].tokens[0].token)
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
            .set('x-auth',users[0].tokens[0].token)
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
});

describe('GET /todos',()=>{
   it('get all the data',(done)=>{
       request(app)
           .get('/todos')
           .set('x-auth',users[0].tokens[0].token)
           .expect(200)
           .expect((res)=>{
               expect(res.body.todos.length).toBe(1);
           })
           .end(done);
   });
});
describe('GET /todos/:id',()=>{
    it('should return a todos with id',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done)
    });
    it('it should not return a todo created by other users',(done)=>{
        var hexID=todos[1]._id.toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
    it('it should return 404 if ID not ObjectId',(done)=>{
        var hexId=new ObjectID().toHexString();

        request(app)
            .get(`/todos/${hexId}`)
            .set('x-auth',users[0].tokens[0].token)
            .expect(404)
            .end(done)
    });
});

describe('/DELETE /todos/:id',()=>{
    it('should remove id from database',(done)=>{
        var hexId1=todos[1]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId1}`)
            .set('x-auth',users[1].tokens[0].token)
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
    it('should not remove todo of other users',(done)=>{
        var hexId1=todos[0]._id.toHexString();
        request(app)
            .delete(`/todos/${hexId1}`)
            .set('x-auth',users[1].tokens[0].token)
            .expect(404)
            .end((err,res)=>{
                if(err) return done(err);
                Todo.findById(hexId1)
                    .then(todo=>{
                        expect(todo).toExist();
                        done();
                    }).catch(err=>done(err));
            });
    });
    it('should return 404 if todo is not found',(done)=>{
        var hexID=new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .set('x-auth',users[1].tokens[0].token)
            .expect(404)
            .end(done)
    });
    it('should return 404 if ID is not ObjectId',(done)=>{
        request(app)
            .delete('/todos/23456')
            .set('x-auth',users[1].tokens[0].token)
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
           .set('x-auth',users[0].tokens[0].token)
           .send({text,completed: true})
           .expect(200)
           .expect((res)=>{
               expect(res.body.todo.text).toBe(text);
               expect(res.body.todo.completed).toBe(true);
               expect(res.body.todo.completedAt).toBeA('number');
           })
           .end(done)
    });
    it('should not update todo by other users',(done)=>{
        var hexId=todos[0]._id.toHexString();
        var text='new patch update';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
            .send({text,completed: true})
            .expect(404)
            .end(done)
    });
    it('should clear updatedAt when todo is not completed',(done)=>{
        var hexId=todos[1]._id.toHexString();
        var text='this is new patch update 2';
        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth',users[1].tokens[0].token)
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

describe('POST /users/login',()=>{
    it('should login user and return a token',(done)=>{
        var email=users[1].email;
        var password=users[1].password;
        request(app)
            .post('/users/login')
            .send({email,password})
            .expect(200)
            .expect(res=>{
                expect(res.headers['x-auth']).toExist()
            })
            .end((err,res)=>{
                if(err) return done(err);

                User.findById(users[1]._id)
                    .then(user=>{
                        expect(user.tokens[1]).toInclude({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    })
                    .catch(err=>done(err));
            });
    });
    it('should reject invalid login',(done)=>{
        var email=users[1].email;
        var password=users[1].password+1;
        request(app)
            .post('/users/login')
            .send({email,password})
            .expect(400)
            .expect(res=>{
                expect(res.headers['x-auth']).toNotExist()
            })
            .end((err,res)=>{
                if(err) return done(err);

                User.findById(users[1]._id)
                    .then(user=>{
                        expect(user.tokens.length).toBe(1);
                        done();
                    })
                    .catch(err=>done(err));
            });
    });
});
 describe('DELETE users/me/token',()=>{
    it('should remove auth token on logout',(done)=>{
        request(app)
            .delete('/users/me/token')
            .set('x-auth',users[0].tokens[0].token)
            .expect(200)
            .end((err,res)=>{
                if(err) return done(err);

                User.findById(users[0]._id)
                    .then(user=>{
                        expect(user.tokens.length).toBe(0);
                        done()
                    }).catch(err=>done(err));
            })
    })
 });