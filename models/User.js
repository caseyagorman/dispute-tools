var bcrypt = require('bcrypt-node');

var User = Class('User').inherits(Krypton.Model)({
  tableName : 'Users',
  validations : {
    email : [
      'required',
      'email',
      'maxLength:255',
      {
        rule : function(val) {
          let target = this.target;

          let query = User.query()
            .where({
              email : val
            });

          if (target.id) {
            query.andWhere('id', '!=', target.id);
          }

          return query.then((result) => {
            if (result.length > 0) {
              throw new Error('The User\'s email already exists.');
            }
          });
        },
        message : 'The User\'s email already exists.'
      },
    ],
    password : ['minLength:8'],
    role : [
      'required',
      {
        rule : function(val) {
          var target = this.target;

          if (User.roles.indexOf(val) === -1) {
            throw new Error('The User\'s role is invalid.');
          }
        },
        message : 'The User\'s role is invalid.'
      }
    ]
  },

  attributes : [
    'id',
    'email',
    'encryptedPassword',
    'activationToken',
    'role',
    'createdAt',
    'updatedAt'
  ],

  roles : ['Admin', 'CollectiveManager', 'User'],

  prototype : {
    email : null,
    password : null,

    init(config) {
      Krypton.Model.prototype.init.call(this, config);

      var model = this;

      // Start Model Hooks:

      var oldEmail = model.email;

      // If password is present hash password and set it as encryptedPassword
      model.on('beforeSave', (done) => {
        if (model.password) {
          bcrypt.hash(model.password, bcrypt.genSaltSync(10), null, (err, hash) => {
            if (err) {
              return done(err);
            }

            model.encryptedPassword = hash;
            done();
          });
        }

        done();
      });

      // Updates old email when record saves
      model.on('afterSave', (done) => {
        oldEmail = model.email;
        done();
      });

      // setActivationToken helper function
      let setActivationToken = (done) => {
        bcrypt.hash(CONFIG.env().sessions.secret + Date.now(), bcrypt.genSaltSync(10), null, (err, hash) => {
          if (err) {
            return done(err);
          }

          model.activationToken =  hash;
          return done();
        });
      }

      // Create a hash and set it as activationToken
      model.on('beforeCreate', (done) => {
        setActivationToken(done);
      });

      // sendActivation helper function
      let sendActivation = (done) => {
        UserMailer.sendActivation(model.email, {user : model})
          .then(function() {
            done();
          })
          .catch(done);
      }

      // Send activation email
      model.on('afterCreate', (done) => {
        sendActivation(done);
      });

      // If email changes, set activationToken again
      model.on('beforeUpdate', (done) => {
        if (oldEmail === model.email) {
          return done();
        }

        setActivationToken(done);
      });

      // If email changed, send activation email
      model.on('afterUpdate', (done) => {
        if (oldEmail === model.email) {
          return done();
        }

        sendActivation(done);
      });
    },

    activate() {
      this.activationToken = null;

      return this;
    }
  }
});

module.exports = User;
