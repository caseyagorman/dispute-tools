/* eslint max-len: 0 */

const path = require('path');

const {
  wageGarnishmentDocument,
  atbDocument,
  unauthorizedSignatureDocument,
  taxOffsetReviewDocument,
  atbDisqualifyingDocument,
  NORMAL_FONT_SIZE,
  SMALL_FONT_SIZE,
  formatDate,
} = require(path.join(__dirname, '../dispute-tools/constants.js'));

module.exports = {
  '11111111-1111-1111-1111-111111111111': {
    A: {
      documents: {
        wage_garnishment: wageGarnishmentDocument,
      },
    },
    B: {
      documents: {
        wage_garnishment: wageGarnishmentDocument,
      },
    },
    C: {
      documents: {
        wage_garnishment: wageGarnishmentDocument,
        ability_to_benefit: atbDocument,
      },
    },
    D: {
      documents: {
        wage_garnishment: wageGarnishmentDocument,
        atb_disqualifying: atbDisqualifyingDocument,
      },
    },
    E: {
      documents: {
        wage_garnishment: wageGarnishmentDocument,
        unauthorized_signature_form: unauthorizedSignatureDocument,
      },
    },
  },
  '11111111-1111-2222-1111-111111111111': {
    A: {
      documents: {
        tax_offset_review: taxOffsetReviewDocument,
      },
    },
    B: {
      documents: {
        tax_offset_review: taxOffsetReviewDocument,
      },
    },
    C: {
      documents: {
        tax_offset_review: taxOffsetReviewDocument,
        ability_to_benefit: atbDocument,
      },
    },
    D: {
      documents: {
        tax_offset_review: taxOffsetReviewDocument,
        atb_disqualifying: atbDisqualifyingDocument,
      },
    },
    E: {
      documents: {
        tax_offset_review: taxOffsetReviewDocument,
        unauthorized_signature_form: unauthorizedSignatureDocument,
      },
    },
  },

  '11111111-1111-3333-1111-111111111111': {
    none: {
      documents: {
        general_dispute_letter: {
          templates: [
            {
              path: '/lib/assets/document_templates/general_debt_dispute_letter/0.png',
              fields: {
                to(template, data) {
                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(374, 356, 'To:')
                    .drawText(374, 460, data.forms['personal-information-form']['agency-name'])
                    .drawText(374, 522, data.forms['personal-information-form']['agency-address'])
                    .drawText(374, 578, data.forms['personal-information-form']['agency-address2']);
                },
                from(template, data) {
                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(1508, 356, 'From:')
                    .drawText(1508, 460, data.forms['personal-information-form'].name)
                    .drawText(1508, 522, data.forms['personal-information-form'].address1)
                    .drawText(1508, 578, data.forms['personal-information-form'].address2);
                },

                'personal-information-form.agency-name': {
                  x: 498,
                  y: 844,
                },

                letterOrPhone(template, data) {
                  const value = data.forms['personal-information-form']['letter-or-phonecall'];

                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(1024, 966, value);

                  template
                    .font('Arial')
                    .fontSize(SMALL_FONT_SIZE)
                    .drawText(1302, 966, formatDate(new Date()));
                },

                'personal-information-form.state': {
                  x: 1360,
                  y: 1528,
                },

                signature(template, data) {
                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(380, 2536, data.forms['personal-information-form'].name);
                },
              },
            },
          ],
        },
      },
    },
  },

  '11111111-1111-4444-1111-111111111111': {
    none: {
      documents: {
        credit_report_dispute_letter: {
          templates: [
            {
              path: '/lib/assets/document_templates/credit_report_dispute_letter/0.png',
              fields: {
                'personal-information-form.name': {
                  x: 500,
                  y: 600,
                },
                dob(template, data) {
                  const value = data.forms['personal-information-form'].dob;

                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(668, 1968, formatDate(new Date(value)));
                },
                'personal-information-form.ssn': {
                  x: 494,
                  y: 2078,
                },
                'personal-information-form.address': {
                  x: 578,
                  y: 2196,
                },
                'personal-information-form.address2': {
                  x: 578,
                  y: 2310,
                },

                'personal-information-form.email': {
                  x: 516,
                  y: 2414,
                },

                'personal-information-form.phone': {
                  x: 516,
                  y: 2534,
                },

                signature(template, data) {
                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(380, 2656, data.forms['personal-information-form'].name);
                },
              },
            },
          ],
        },
        agencies: {
          templates: [
            {
              path: '/lib/assets/document_templates/blank/0.png',
              fields: {
                agencies(template, data) {
                  let agencies = data.forms['personal-information-form'].agencies;

                  if (!Array.isArray(agencies)) {
                    agencies = [agencies];
                  }

                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(162, 230, 'Send To:');

                  agencies.forEach((agency) => {
                    if (agency === 'Experian') {
                      template
                        .drawText(162, 330, 'Experian \nNational Consumer Assistance Center \nP.O. Box 2002 \nAllen, TX 75013');
                    }

                    if (agency === 'Equifax') {
                      template
                        .drawText(162, 730, 'Equifax Credit Information Services, Inc. \nP.O. Box 740241 \nAtlanta, GA 30374');
                    }

                    if (agency === 'TransUnion') {
                      template
                        .drawText(162, 1130, 'TransUnion LLC \nConsumer Disclosure Center \nP.O. Box 1000 \nChester, PA 19022');
                    }
                  });
                },
              },
            },
          ],
        },
      },
    },
  },

  '11111111-1111-6666-1111-111111111111': {
    none: {
      documents: {
        private_student_loan_dispute_letter: {
          templates: [
            {
              path: '/lib/assets/document_templates/private_student_load_dispute_letter/0.png',
              fields: {
                from(template, data) {
                  const address = data.forms['personal-information-form'].address;
                  const address2 = data.forms['personal-information-form'].address2;
                  const name = data.forms['personal-information-form'].name;

                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(1420, 230, 'From:')
                    .drawText(1420, 334, name)
                    .drawText(1420, 396, address)
                    .drawText(1420, 452, address2);
                },
                to(template, data) {
                  const address = data.forms['personal-information-form']['firm-address'];
                  const address2 = data.forms['personal-information-form']['firm-address2'];
                  const name = data.forms['personal-information-form']['firm-name'];

                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(374, 230, 'To:')
                    .drawText(374, 334, name)
                    .drawText(374, 396, address)
                    .drawText(374, 452, address2);
                },
                date(template) {
                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(1420, 508, formatDate(new Date()));
                },

                'personal-information-form.firm-name': {
                  x: 494,
                  y: 662,
                },
                'personal-information-form.account-number': {
                  x: 1272,
                  y: 792,
                },
                lastCorrespondence(template, data) {
                  const value = data.forms['personal-information-form']['last-correspondence-date'];

                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(1272, 852, formatDate(new Date(value)));
                },

                signature(template, data) {
                  template
                    .font('Arial')
                    .fontSize(NORMAL_FONT_SIZE)
                    .drawText(372, 3042, data.forms['personal-information-form'].name);
                },
              },
            },
          ],
        },
      },
    },
  },
};