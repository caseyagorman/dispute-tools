/* globals CONFIG, Dispute, DisputeTool, User, Account */

const {
  createUser,
  createDispute,
  testGetPage,
  testPutPage,
  testGet,
  testPost,
  testPut,
  testDelete,
  testUnauthenticated,
  testAllowed,
  testNoContent,
  testForbidden,
  testNotFound,
} = require('$tests/utils');
const {
  wageGarnishmentDisputes: {
    A: {
      data: {
        forms: { 'personal-information-form': sampleData },
      },
    },
  },
} = require('../../utils/sampleDisputeData');

const { join } = require('path');
const PrivateAttachmentStorage = require('../../../models/PrivateAttachmentStorage');
const sinon = require('sinon');
const nock = require('nock');
const { expect } = require('chai');

const {
  router: { helpers: urls },
  discourse: { adminRole, baseUrl: discourse },
} = CONFIG;

describe('Admin.DisputesController', () => {
  let user;
  let admin;

  before(async () => {
    user = await createUser();
    admin = await createUser({ admin: true });
  });

  describe('index', () => {
    const url = urls.Admin.Disputes.url();

    describe('authorization', () => {
      before(() => {
        nock(discourse)
          .get('/admin/users/list/active.json')
          .times(2)
          .query(true)
          .reply(200, []);
      });

      describe('when unauthenticated', () => {
        it('should redirect to login', () => testUnauthenticated(testGetPage(url)));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testGetPage(url, user)));
      });

      describe('when admin', () => {
        it('should allow', () => testAllowed(testGetPage(url, admin)));
      });
    });
  });

  describe('update', () => {
    let url;
    const status = {
      comment: 'Test status',
      status: 'Incomplete',
      note: 'test note',
      notify: false,
    };

    before(async () => {
      const dispute = await createDispute(await createUser());
      url = urls.Admin.Disputes.update.url(dispute.id);
    });

    describe('authorization', () => {
      describe('when unauthenticated', () => {
        it('should redirect to login', () => testUnauthenticated(testPutPage(url, status)));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testPutPage(url, status, user)));
      });

      describe('when admin', () => {
        it('should allow', () => testAllowed(testPutPage(url, status, admin)));
      });
    });
  });

  describe('updateAdmins', () => {
    let url;

    before(async () => {
      const dispute = await createDispute(await createUser());
      url = urls.Admin.Disputes.updateAdmins.url(dispute.id);
    });

    describe('authorization', () => {
      describe('when unauthenticated', () => {
        it('should redirect to login', () => testForbidden(testPost(url, [])));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testPost(url, [], user)));
      });

      describe('when admin', () => {
        it('should allow', () => testAllowed(testPost(url, [], admin)));
      });
    });
  });

  describe('updateDisputeData', () => {
    let url;
    let dispute;

    before(async () => {
      dispute = await createDispute(await createUser());
      url = urls.Admin.Disputes.updateDisputeData.url(dispute.id);
    });

    describe('authorization', () => {
      let setForm;
      before(() => {
        setForm = Dispute.prototype.setForm;
        Dispute.prototype.setForm = function setFormMock() {
          return this;
        };
      });

      after(() => {
        Dispute.prototype.setForm = setForm;
      });

      describe('when unauthenticated', () => {
        it('should redirect to login', () => testForbidden(testPut(url, {})));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testPut(url, {}, user)));
      });

      describe('when admin', () => {
        it('should allow', () => testAllowed(testPut(url, {}, admin)));
      });
    });

    it('should update the form', async () => {
      const body = {
        formName: 'personal-information-form',
        fieldValues: { ...sampleData, city: 'TEST CiTyName' },
      };

      try {
        await testPut(url, body, admin);
      } catch (e) {
        expect.fail(e);
      }

      let updatedDispute = null;

      try {
        updatedDispute = await Dispute.findById(dispute.id);
      } catch (e) {
        expect.fail(e);
      }

      expect(updatedDispute.data.forms).eql({
        'personal-information-form': body.fieldValues,
      });
    });
  });

  describe('getAvailableAdmins', () => {
    let url;

    before(async () => {
      const dispute = await createDispute(await createUser());
      url = urls.Admin.Disputes.getAvailableAdmins.url(dispute.id);

      nock(discourse)
        .get(`/groups/${adminRole}/members.json`)
        .query(true)
        .times(2)
        .reply(200, {
          members: [
            {
              ...admin,
              id: admin.externalId,
            },
          ],
          owners: [],
        });
    });

    describe('authorization', () => {
      describe('when unauthenticated', () => {
        it('should redirect to login', () => testForbidden(testGet(url)));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testGet(url, user)));
      });

      describe('when admin', () => {
        it('should allow', () => testAllowed(testGet(url, admin)));
      });
    });
  });

  describe('downloadAttachment', () => {
    let url;

    before(async () => {
      try {
        // Prevent uploading files to S3
        sinon.stub(PrivateAttachmentStorage.prototype, 'saveStream').returns(
          Promise.resolve({
            original: {
              ext: 'jpeg',
              mimeType: 'image/jpeg',
              width: 1280,
              height: 1335,
              key: 'test/DisputeAttachment/6595579a-b170-4ffd-87b3-2439f3d032fc/file/original.jpeg',
            },
          }),
        );
      } catch (e) {
        if (e.message !== 'Attempted to wrap saveStream which is already wrapped') throw e;
      }

      const dispute = await createDispute(await createUser());
      const assetPath = join(process.cwd(), 'tests/assets/hubble.jpg');
      await dispute.addAttachment('test-attachment', assetPath);
      const attachment = dispute.data.attachments[0];
      url = `${urls.Admin.Disputes.url()}/${dispute.id}/attachment/${attachment.id}`;
    });

    describe('authorization', () => {
      describe('when unauthenticated', () => {
        it('should redirect to login', () => testUnauthenticated(testGetPage(url)));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testGetPage(url, user)));
      });

      describe('when admin', () => {
        it('should allow', () => testAllowed(testGetPage(url, admin)));
      });
    });

    it('should redirect to the signed AWS url', async () => {
      let caught;
      try {
        await testGetPage(url, admin).redirects(0);
      } catch (e) {
        caught = e;
      }

      expect(caught).exist;
      expect(caught.status).eq(302);
      expect(caught.response.headers.location.includes('s3.amazonaws.com')).true;
    });
  });

  describe('deleteAttachment', () => {
    let url1;

    before(async () => {
      try {
        // Prevent uploading files to S3
        sinon.stub(PrivateAttachmentStorage.prototype, 'saveStream').returns(
          Promise.resolve({
            original: {
              ext: 'jpeg',
              mimeType: 'image/jpeg',
              width: 1280,
              height: 1335,
              key: 'test/DisputeAttachment/6595579a-b170-4ffd-87b3-2439f3d032fc/file/original.jpeg',
            },
          }),
        );
      } catch (e) {
        if (e.message !== 'Attempted to wrap saveStream which is already wrapped') throw e;
      }

      const dispute = await createDispute(await createUser());
      const assetPath = join(process.cwd(), 'tests/assets/hubble.jpg');

      await dispute.addAttachment('test-attachment', assetPath);
      const attachment1 = dispute.data.attachments[0];
      url1 = `${urls.Admin.Disputes.url()}/${dispute.id}/attachment/${attachment1.id}`;

      await dispute.addAttachment('test-attachment', assetPath);
    });

    describe('authorization', () => {
      describe('when unauthenticated', () => {
        it('should redirect to login', () => testUnauthenticated(testDelete(url1)));
      });

      describe('when user', () => {
        it('should reject', () => testForbidden(testDelete(url1, user)));
      });

      describe('when admin', () => {
        it('should allow', () => testNoContent(testDelete(url1, admin)));

        it('should have deleted the attachment', () => testNotFound(testGet(url1, admin)));
      });
    });
  });
});
