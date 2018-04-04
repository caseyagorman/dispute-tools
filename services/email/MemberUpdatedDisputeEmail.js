const Email = require('./Email');
const { mailers: { contactEmail } } = require('../../config/config');

class MemberUpdatedDisputeEmail extends Email {
  constructor(member, dispute, disputeStatus) {
    super('MemberUpdatedDisputeEmail', {
      to: MemberUpdatedDisputeEmail.to,
      from: `${member.fullname} <${contactEmail}>`,
      subject: `${member.fullname} has updated their dispute...`,
    });

    this.locals = { member, dispute, disputeStatus };
  }
}

MemberUpdatedDisputeEmail.to = `The Debt Syndicate Organizers <${contactEmail}>`;

module.exports = MemberUpdatedDisputeEmail;