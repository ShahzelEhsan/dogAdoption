require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app'); 
const mongoose = require('mongoose');
const Dog = require('../models/Dog');
const User = require('../models/User');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Dog Routes', () => {
  let token;
  let dogId;
  let otherUserToken;

  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await Dog.deleteMany({});
    await User.deleteMany({});

    // Register and login primary user
    await chai.request(app)
      .post('/api/auth/register')
      .send({ username: 'owner', password: 'pass' });

    const res = await chai.request(app)
      .post('/api/auth/login')
      .send({ username: 'owner', password: 'pass' });

    token = res.body.token;

    // Register and login second user
    await chai.request(app)
      .post('/api/auth/register')
      .send({ username: 'adopter', password: 'pass' });

    const res2 = await chai.request(app)
      .post('/api/auth/login')
      .send({ username: 'adopter', password: 'pass' });

    otherUserToken = res2.body.token;
  });

  it('should allow owner to register a dog', done => {
    chai.request(app)
      .post('/api/dogs')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Buddy', description: 'Friendly dog' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.name).to.equal('Buddy');
        dogId = res.body._id;
        done();
      });
  });

  it('should allow another user to adopt the dog', done => {
    chai.request(app)
      .post(`/api/dogs/${dogId}/adopt`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ thankYouMessage: 'Thank you!' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.status).to.equal('adopted');
        done();
      });
  });

  it('should not allow re-adoption', done => {
    chai.request(app)
      .post(`/api/dogs/${dogId}/adopt`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ thankYouMessage: 'Trying again' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should prevent owner from deleting an adopted dog', done => {
    chai.request(app)
      .delete(`/api/dogs/${dogId}`)
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should list registered dogs', done => {
    chai.request(app)
      .get('/api/dogs/registered')
      .set('Authorization', `Bearer ${token}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('should list adopted dogs for adopter', done => {
    chai.request(app)
      .get('/api/dogs/adopted')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.length).to.equal(1);
        expect(res.body[0].status).to.equal('adopted');
        done();
      });
  });

  after(async () => {
    await Dog.deleteMany({});
    await User.deleteMany({});
    await mongoose.disconnect();
  });
});
