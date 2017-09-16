'use strict';

const app = require('./app');
const server = app.listen();
const request = require('supertest');
const assert = require('assert');
const expect = require('chai').expect;

const NON_EXPIRING_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoiYWRtaW4iLCJlbWF' +
    'pbCI6ImFkbWluQG15LmFwaSIsIm5hbWUiOiJBZG1pbiIsInJvbGUiOiJhZG1pbiJ9LCJpYXQiOjE1MDU' +
    '1NjQ2MzR9.EJY20Ug0BXEBpJ8C2LmyPwh2mXOhaIw9DzCOj4Tu0tw';

const VALID_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoidGhlZHVkZSIsIm5' +
    'hbWUiOiJNci4gTGVib3dza2kifSwiZXhwIjo0NjU4NTkxNzEzLCJpYXQiOjE1MDQ5OTE3MTN9.nZqc6O' +
    'SdccIx4NXovqqHW5iXAyIsPhEkT2SiwyW1LvU';

const EXPIRED_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoidGhlZHVkZSIsIm5' +
    'hbWUiOiJNci4gTGVib3dza2kifSwiZXhwIjoxNTA0OTkxODIxLCJpYXQiOjE1MDQ5OTE4MjJ9.llUQYi' +
    'eU1sdd-0RAL6IbqJWT4OkuwPDugumFq_APJPY';

const INVALID_SIGNATURE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoidGhlZHVkZSIsIm5' +
    'hbWUiOiJNci4gTGVib3dza2kifSwiZXhwIjoxNTA0OTkxODIxLCJpYXQiOjE1MDQ5OTE4MjJ9.llUQYi' +
    'eU1sdd-0RAL6IbqJWT4OkuwPDugumFq_APJP1';

const INVALID_TOKEN = 'e1JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoidGhlZHVkZSIsIm5' +
    'hbWUiOiJNci4gTGVib3dza2kifSwiZXhwIjoxNTA0OTkxODIxLCJpYXQiOjE1MDQ5OTE4MjJ9.llUQYi' +
    'eU1sdd-0RAL6IbqJWT4OkuwPDugumFq_APJPY';

const JWT_MALFORMED_TOKEN = 'e1JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InVzZXJuYW1lIjoidGhlZHVkZSIsIm5' +
    'hbWUiOiJNci4gTGVib3dza2kifSwiZXhwIjoxNTA0OTkxODIxLCJpYXQiOjE1MDQ5OTE4MjJ9';

describe('Admin routes', () => {

  it('should allow POST requests to the "/admin/user/create" route with an admin token' +
      '',
  done => {
    request(server)
      .post('/admin/user/create')
      .set('Authorization', 'Bearer ' + NON_EXPIRING_ADMIN_TOKEN)
      .send({uid: "asdf", username: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(200)
      .end(done);
  })

  it('should return 400 for bad POST requests to the "/admin/user/create" route with a' +
      'n admin token',
  done => {
    request(server)
      .post('/admin/user/create')
      .set('Authorization', 'Bearer ' + NON_EXPIRING_ADMIN_TOKEN)
      .send({uid: "asdf", user: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(400)
      .end(done);
  })

  it('should return 406 for a POST request for an existing user with the "/admin/user/' +
      'create" route with an admin token',
  done => {
    request(server)
      .post('/admin/user/create')
      .set('Authorization', 'Bearer ' + NON_EXPIRING_ADMIN_TOKEN)
      .send({uid: "asdf", username: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(406)
      .end(done);
  })

  it('should delete a user for a POST request to the "/admin/user/delete" route with a' +
      'n admin token',
  done => {
    request(server)
      .post('/admin/user/delete')
      .send({username: 'user1'})
      .set('Authorization', 'Bearer ' + NON_EXPIRING_ADMIN_TOKEN)
      .expect(200)
      .end(function (err, result) {
        expect(result.body.message)
          .to
          .equal('success');
        done();
      });
  })

  it('should return a 401 for a POST request to the "/admin/user/delete" route with a ' +
      'user token',
  done => {
    request(server)
      .post('/admin/user/delete')
      .send({username: 'user1'})
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .expect(401)
      .end(done);
  })

  it('should return a 401 for a POST request to the "/admin/user/create" route with a ' +
      'user token',
  done => {
    request(server)
      .post('/admin/user/create')
      .send({uid: "asdf", username: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .expect(401)
      .end((err, result) => {
        expect(result.body.error)
          .to
          .equal('admin required');
        done();
      });
  })
})

describe('Public routes', () => {
  before((done) => {
    request(server)
      .post('/admin/user/create')
      .set('Authorization', 'Bearer ' + NON_EXPIRING_ADMIN_TOKEN)
      .send({uid: "asdf", username: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(200)
      .end((err, result) => {
        expect(result.body.error).to.be.undefined;
        done();
      });
  })

  it('should allow GET requests to the base "/" route', done => {
    request(server)
      .get('/')
      .expect(200)
      .end(done);
  });

  it('should allow POST requests to the "login" route', done => {
    request(server)
      .post('/login')
      .send({username: 'user1', password: 'password1'})
      .expect(200)
      .end(done);
  })

  it('should return 401 for bad POST requests to the "login" route', done => {
    request(server)
      .post('/login')
      .send({username: 'user2', password: 'password1'})
      .expect(401)
      .end(done);
  })
});
describe('Private routes', () => {
  it('should prevent requests to the "/api/v1" route without a token', done => {
    request(server)
      .post('/api/v1/node/create')
      .expect(401)
      .end(done);
  });
});

describe('Token Exceptions', () => {
  it('should return "token expired" for a POST request to a private route if the token' +
      ' has expired',
  done => {
    request(server)
      .post('/api/v1/node/read')
      .set('Authorization', 'Bearer ' + EXPIRED_TOKEN)
      .expect(401)
      .end(function (err, result) {
        assert.equal(result.body.error, 'jwt expired');
        done();
      });
  })

  it('should return "invalid signature" for a POST request to a private route if the t' +
      'oken signature is invalid',
  done => {
    request(server)
      .post('/api/v1/node/read')
      .set('Authorization', 'Bearer ' + INVALID_SIGNATURE_TOKEN)
      .expect(401)
      .end(function (err, result) {
        assert.equal(result.body.error, 'invalid signature');
        done();
      });
  })

  it('should return "invalid token" for a POST request to a private route if the token' +
      ' is invalid',
  done => {
    request(server)
      .post('/api/v1/node/read')
      .set('Authorization', 'Bearer ' + INVALID_TOKEN)
      .expect(401)
      .end(function (err, result) {
        assert.equal(result.body.error, 'invalid token');
        done();
      });
  })

  it('should return "jwt malformed" for a POST request to a private route if the token' +
      ' is malformed',
  done => {
    request(server)
      .post('/api/v1/node/read')
      .set('Authorization', 'Bearer ' + JWT_MALFORMED_TOKEN)
      .expect(401)
      .end(function (err, result) {
        assert.equal(result.body.error, 'jwt malformed');
        done();
      });
  })
});
describe('Node routes', () => {
  it('should create a node for a POST request to /api/v1/node/create', done => {
    request(server)
      .post('/api/v1/node/create')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf", username: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result.uid)
          .to
          .equal('asdf');
        done();
      });
  })

  it('should update a node for a POST request to /api/v1/node/update', done => {
    request(server)
      .post('/api/v1/node/update')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf", username: 'user2', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result.username)
          .to
          .equal('user2');
        done();
      });
  })

  it('should read   a node for a POST request to /api/v1/node/read', done => {
    request(server)
      .post('/api/v1/node/read')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf"})
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result, 'result.body.result should not be null').to.not.be.null;
        expect(result.body.result.uid)
          .to
          .equal('asdf')
        done();
      });
  })

  it('should delete a node for a POST request to /api/v1/node/delete', done => {
    request(server)
      .post('/api/v1/node/delete')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf"})
      .expect(200)
      .end(function (err, result) {
        expect(result.body.error, 'error should be null').to.be.undefined;
        expect(result.body.result.count, 'result should equal 1')
          .to
          .equal(1)
        done();
      });
  })
})

describe('Relationship routes', () => {
  before(async() => {
    await request(server)
      .post('/api/v1/node/create')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf1", username: 'user1', password: 'password1', email: 'user1@gmail.com', name: 'Mr. Lebowski'})
      .expect(200)
    await request(server)
      .post('/api/v1/node/create')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf2", username: 'user2', password: 'password2', email: 'user2@gmail.com', name: 'Mr. Johnson'})
      .expect(200)
  });

  after(async() => {
    await request(server)
      .post('/api/v1/node/delete')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf1"})
      .expect(200)
    await request(server)
      .post('/api/v1/node/delete')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({uid: "asdf2"})
      .expect(200)
  });

  it('should create a relationship for a POST request to /api/v1/relationship/create', done => {
    request(server)
      .post('/api/v1/relationship/create')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({
        uidLeft: "asdf1",
        uidRight: "asdf2",
        type: "KNOWS",
        props: {
          weight: 1,
          uid: 'rel1'
        }
      })
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result.error, 'error should be null').to.be.undefined;
        expect(result.body.result.uid)
          .to
          .equal('rel1')
        done();
      });
  })

  it('should update a relationship for a POST request to /api/v1/relationship/update', done => {
    request(server)
      .post('/api/v1/relationship/update')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({
        uidLeft: "asdf1",
        uidRight: "asdf2",
        type: "KNOWS",
        props: {
          weight: 2,
          uid: 'rel1'
        }
      })
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result.error).to.be.undefined
        expect(result.body.result.weight)
          .to
          .equal(2);
        done();
      });
  })

  it('should read   a relationship for a POST request to /api/v1/relationship/read', done => {
    request(server)
      .post('/api/v1/relationship/read')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result, 'result.body.result should not be null').to.not.be.null;
        done();
      });
  })

  it('should delete a relationship for a POST request to /api/v1/relationship/delete', done => {
    request(server)
      .post('/api/v1/relationship/delete')
      .set('Authorization', 'Bearer ' + VALID_TOKEN)
      .send({
        uidLeft: "asdf1",
        uidRight: "asdf2",
        type: "KNOWS",
        props: {
          weight: 1,
          uid: 'rel1'
        }
      })
      .expect(200)
      .end(function (err, result) {
        expect(result.body.result.error, 'error should be null').to.be.null;
        expect(result.body.result.count, 'result should equal 1')
          .to
          .equal(1)
        done();
      });
  })
})
