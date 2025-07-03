require('dotenv').config();

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const User = require('../models/User');
const mongoose = require('mongoose');
const expect = chai.expect;
chai.use(chaiHttp);

describe('Auth Routes', () => {
  before(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    await User.deleteMany({});
  });

  let token;

  it('should register a new user', done => {
    chai.request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpass' })
      .end((err, res) => {
        expect(res).to.have.status(201);
        expect(res.body.token).to.exist;
        token = res.body.token;
        done();
      });
  });

  it('should not register with same username again', done => {
    chai.request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'testpass' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  it('should log in an existing user', done => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpass' })
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.token).to.exist;
        token = res.body.token;
        done();
      });
  });

  it('should reject wrong password', done => {
    chai.request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'wrongpass' })
      .end((err, res) => {
        expect(res).to.have.status(400);
        done();
      });
  });

  after(async () => {
    await User.deleteMany({});
    await mongoose.disconnect();
  });
});
