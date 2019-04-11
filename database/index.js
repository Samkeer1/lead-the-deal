require('dotenv').config();
const Sequelize = require('sequelize');
const bcrypt    = require('bcrypt');
const username = process.env.username || "root";
const password = process.env.password;
const host = process.env.host;

const sequelize = new Sequelize('lead_the_deal', username, password, {
  dialect: 'mysql',
  host: host,
});


///////////////////
/////MODELS ///////
///////////////////

//TODO: add maybe short description field of who the person is? Upon Registration

const User = sequelize.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: Sequelize.STRING,
  company: Sequelize.STRING,
  email: Sequelize.STRING,
  points: {
    type: Sequelize.INTEGER,
    defaultValue: 10,
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.fn('NOW')
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.fn('NOW')
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  last_login: Sequelize.DATE,
  status: {
    type: Sequelize.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
    timestamps: false,
    hooks: {
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      isValidPassword(password) {
        return bcrypt.compare(password, this.password);
      }
    }
})



//TODO: veryify isEmail true, maybe is Phone number true (sequelize docs)


const Contact = sequelize.define('contact', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: Sequelize.STRING,
  position: Sequelize.STRING,
  company: Sequelize.STRING,
  industry: Sequelize.STRING,
  phone: Sequelize.STRING,
  email: Sequelize.STRING,
  Address: Sequelize.STRING,
  times_purchased: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.fn('NOW')
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.fn('NOW')
  }
})

const Purchase = sequelize.define('purchase', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  createdAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.fn('NOW')
  },
  updatedAt: {
    type: Sequelize.DATE,
    defaultValue: sequelize.fn('NOW')
  }
})


//////////////////////
/////RELATIONSHIPS////
//////////////////////

User.hasMany(Contact, {as: 'Uploads'});
Contact.belongsTo(User);
User.belongsToMany(Contact, {as: 'Contacts', through: {model: Purchase, unique: false}, foreignKey: 'user_id'});
Contact.belongsToMany(User, {as: 'Users', through: {model: Purchase, unique: false}, foreignKey: 'contact_id'});


///////////////////////////////////////////
/////////////HELPER FUNCTIONS//////////////
//////////////////////////////////////////


const purchasedContacts = function (callback, id) {
  if (id === 'userId') {
    id = 1
  }
  Purchase.findAll({
    where: {
      user_id: id
    }
  })
    .then((contacts) => {
      const purchasedArr = contacts.map((contact)=> contact.contact_id)
      
      return contacts.map((contact) => contact.contact_id)
    })
      .then((contactIds)=>{
        return Contact.findAll({
          where:{
            id: contactIds
          }
        })
      })
      .then((purchased)=>{
        return callback(purchased)
      })
    .catch((err) => {
      console.log(err)
    })
}


////////////////////
///// EXPORTS //////
////////////////////

module.exports.sequelize = sequelize;
module.exports.User = User;
module.exports.Contact = Contact;
module.exports.Purchase = Purchase;
module.exports.purchasedContacts = purchasedContacts

