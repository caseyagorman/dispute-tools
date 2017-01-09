/* globals CONFIG, Dispute, DisputeTool, User, Account, Collective */

const sa = require('superagent');
const expect = require('chai').expect;
const path = require('path');
const Promise = require('bluebird');

const truncate = require(path.join(process.cwd(), 'tests', 'utils', 'truncate'));
const { createUser } = require('../../utils/helpers.js');

const agent = sa.agent();
const url = CONFIG.env().siteURL;
const urls = CONFIG.router.helpers;

describe('DisputesController', () => {
  const data = {};
  let _csrf;

  before(function before() {
    this.timeout(5000);

    return Promise.each(['User', 'Admin'], (role) => {
      return createUser(role)
        .then((res) => {
          data[role] = res;
        });
    })
    .then(() => {
      return DisputeTool.first({
        id: '11111111-1111-1111-1111-111111111111'
      })
        .then((tool) => {
          return tool.createDispute({
            user: data.User,
            option: tool.data.options.A ? 'A' : 'none',
          })
          .then((disputeId) => {
            data.disputeTool = tool;
            data.disputeId = disputeId;
          });
        });
    });
  });

  after(() => {
    truncate([User, Account]);
  });

  it('Should forbid Visitor access to index', (done) => {
    agent.get(`${url}${urls.Disputes.url()}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to show', (done) => {
    agent.get(`${url}${urls.Disputes.show.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to edit', (done) => {
    agent.get(`${url}${urls.Disputes.edit.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to new', (done) => {
    agent.get(`${url}${urls.Disputes.new.url()}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to create', (done) => {
    agent.post(`${url}${urls.Disputes.create.url()}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        disputeToolId: data.disputeTool.id,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should return an error if sent params are invalid', (done) => {
    agent.post(`${url}${urls.Disputes.create.url()}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        // disputeToolId: data.disputeTool.id,
        // Will not send the disputeToold id, must return an error
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(500);
        done();
      });
  });

  it('Should forbid Visitor access to update', (done) => {
    agent.put(`${url}${urls.Disputes.update.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to updateDisputeData', (done) => {
    agent.put(`${url}${urls.Disputes.updateDisputeData.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to addAttachment', (done) => {
    agent.post(`${url}${urls.Disputes.addAttachment.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should forbid Visitor access to destroy', (done) => {
    agent.delete(`${url}${urls.Disputes.destroy.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(403);
        done();
      });
  });


  it('Should allow a User to view index', function (done) {
    this.timeout(10000);

    agent.post(`${url}${urls.login.url()}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        email: data.User.email,
        password: '12345678',
      })
      .end((err) => {
        expect(err).to.be.equal(null);

        agent.get(`${url}${urls.Disputes.url()}`)
          .set('Accept', 'text/html')
          .end((_err, res) => {
            expect(res.status).to.equal(200);
            done();
          });
      });
  });

  it('Should allow a User to view its dispute show', (done) => {
    agent.get(`${url}${urls.Disputes.show.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should allow a User to view its dispute edit', (done) => {
    agent.get(`${url}${urls.Disputes.edit.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should forbid a User to view new', (done) => {
    agent.get(`${url}${urls.Disputes.new.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .end((err, res) => {
        expect(res.status).to.equal(403);
        done();
      });
  });

  it('Should allow a User create a new dispute', (done) => {
    agent.post(`${url}${urls.Disputes.create.url()}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        disputeToolId: data.disputeTool.id,
        option: data.disputeTool.data.options.A ? 'A' : 'none',
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(200);
        expect(res.redirects.length).to.be.equal(1);
        expect(res.redirects[0]).to.have.string('/disputes/');
        done();
      });
  });

  it('Should allow a User update a its dispute', (done) => {
    agent.put(`${url}${urls.Disputes.update.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        comment: 'Updated status',
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should allow a User add a form to its dispute', (done) => {
    agent.put(`${url}${urls.Disputes.updateDisputeData.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        command: 'setForm',
        name: 'the-form',
        fieldValues: {
          name: 'name',
          address1: 'address 1 street',
        },
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should fail if a User add a form to its dispute with invalid data', (done) => {
    agent.put(`${url}${urls.Disputes.updateDisputeData.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        command: 'setForm',
        // name: 'the-form',
        fieldValues: {
          name: 'name',
          address1: 'address 1 street',
        },
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.redirects.length).to.equal(1);
        expect(res.redirects[0]).to.have.string(data.disputeId);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should allow a User set the dispute process to its dispute', (done) => {
    agent.put(`${url}${urls.Disputes.updateDisputeData.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        command: 'setDisputeProcess',
        process: 1,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should fail if a User set the process to its dispute with invalid data', (done) => {
    agent.put(`${url}${urls.Disputes.updateDisputeData.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        command: 'setDisputeProcess',
        // process: 1,
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.redirects.length).to.equal(1);
        expect(res.redirects[0]).to.have.string(data.disputeId);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should allow a User set the signature to its dispute', (done) => {
    agent.put(`${url}${urls.Disputes.setSignature.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        signature: 'User Full Name',
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should fail if a User set the signature to its dispute with invalid data', (done) => {
    agent.put(`${url}${urls.Disputes.setSignature.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        // signature: 'User Full Name',
      })
      .end((err, res) => {
        _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.redirects.length).to.equal(1);
        expect(res.redirects[0]).to.have.string(data.disputeId);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should fail if a User sends an invalid command to updateDisputeData', (done) => {
    agent.put(`${url}${urls.Disputes.updateDisputeData.url(data.disputeId)}`)
      .set('Accept', 'text/html')
      .send({
        _csrf,
        command: 'invalidCommand',
      })
      .end((err, res) => {
        // _csrf = unescape(/XSRF-TOKEN=(.*?);/.exec(res.headers['set-cookie'])[1]);
        expect(res.status).to.equal(500);
        done();
      });
  });

  it('Should allow a User to add an attachment to its dispute', (done) => {
    agent.post(`${url}${urls.Disputes.addAttachment.url(data.disputeId)}`)
      .field('_csrf', _csrf)
      .field('name', 'uploader-1')
      .attach('attachment', path.join(process.cwd(), 'tests/assets/hubble.jpg'))
      .end((err, res) => {
        expect(res.redirects.length).to.equal(1);
        expect(res.redirects[0]).to.have.string(data.disputeId);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should allow a User to add multiple attachments to its dispute', (done) => {
    agent.post(`${url}${urls.Disputes.addAttachment.url(data.disputeId)}`)
      .field('_csrf', _csrf)
      .field('name', 'uploader-1')
      .attach('attachment', path.join(process.cwd(), 'tests/assets/hubble.jpg'))
      .attach('attachment', path.join(process.cwd(), 'tests/assets/hubble.jpg'))
      .attach('attachment', path.join(process.cwd(), 'tests/assets/hubble.jpg'))
      .end((err, res) => {
        expect(res.redirects.length).to.equal(1);
        expect(res.redirects[0]).to.have.string(data.disputeId);
        expect(res.status).to.equal(200);
        done();
      });
  });

  it('Should fail if a User does not provide an attachment to upload to its dispute', (done) => {
    agent.post(`${url}${urls.Disputes.addAttachment.url(data.disputeId)}`)
      .field('_csrf', _csrf)
      .field('name', 'uploader-1')
      // .attach('attachment', path.join(process.cwd(), 'tests/assets/hubble.jpg'))
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.redirects.length).to.equal(1);
        expect(res.redirects[0]).to.have.string(data.disputeId);
        expect(res.text).to.have.string('There is no file to process');
        done();
      });
  });

});