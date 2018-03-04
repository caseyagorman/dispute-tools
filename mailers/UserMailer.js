/* globals Class, BaseMailer, CONFIG */

const UserMailer = Class('UserMailer').inherits(BaseMailer)({
  _options: {
    from: `The Debt Collective <${CONFIG.mailers.senderEmail}>`,
    subject: 'The Debt Collective',
  },

  sendActivation(...args) {
    return this._send('sendActivation', ...args);
  },

  sendResetPasswordLink(...args) {
    return this._send('sendResetPasswordLink', ...args);
  },

  sendDispute(...args) {
    return this._send('sendDispute', ...args);
  },

  sendSubscription(...args) {
    return this._send('sendSubscription', ...args);
  },

  sendDisputeToAdmin(locals) {
    const mails = CONFIG.mailers.disputesBCCAddresses;

    return this._send('sendDisputeToAdmin', mails, locals);
  },
});

module.exports = UserMailer;
