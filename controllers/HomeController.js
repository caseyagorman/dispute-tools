/* globals Class, BaseController, logger, CONFIG */

const stripe = require('stripe');

const stripeClient = stripe(CONFIG.env().stripe.secret);

const HomeController = Class('HomeController').inherits(BaseController)({
  prototype: {
    _authenticate(req, res, next) {
      if (!req.user) {
        return res.format({
          html() {
            req.flash('info', 'You have to login first.');
            return res.redirect(CONFIG.router.helpers.login.url());
          },
          json() {
            return res.status(403).end();
          },
        });
      }

      return next();
    },

    donate(req, res) {
      const token = req.body.token;
      const amount = Math.floor(Number(req.body.amount));
      const options = {
        amount,
        currency: 'usd',
        source: token,
        description: `Donation for Debt Collective: ${amount / 100}`,
      };

      if (!token) {
        return res.status(400).json({ error: { message: 'Invalid token' } });
      }

      return stripeClient.charges.create(options, (error, charge) => {
        if (error) {
          console.log(error)
          res.status(500).json({ error: { message: 'Something went wrong, please try again.' } });
        } else {
          res.status(200).json({ success: charge.captured && charge.paid && charge.status === 'succeeded' });
        }
      });
    },

    admin(req, res) {
      res.render('home/admin.pug');
    },

    index(req, res) {
      res.render('home/index.pug');
    },

    about(req, res) {
      res.render('home/about');
    },

    tos(req, res) {
      res.render('home/tos.pug');
    },

    tools(req, res) {
      res.render('home/tools');
    },

    tool(req, res) {
      res.render('home/tool');
    },
  },
});

module.exports = new HomeController();
