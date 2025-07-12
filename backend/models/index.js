const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

//User model
const User = sequelize.define(
  'User',
  {
    firebase_uid: { type: DataTypes.STRING, unique: true, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
    role: {
      type: DataTypes.ENUM('admin', 'staff'),
      defaultValue: 'staff',
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,    
    underscored: true,   
  }
);

//Transporter model
const Transporter = sequelize.define(
  'Transporter',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    contact_number: { type: DataTypes.STRING },
    vehicle_type: { type: DataTypes.STRING },
    capacity_tons: { type: DataTypes.INTEGER },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
    },
  },
  {
    tableName: 'transporters',
    timestamps: true,
    underscored: true,
  }
);

// Bid model
const Bid = sequelize.define(
  'Bid',
  {
    material_type: { type: DataTypes.STRING, allowNull: false },
    quantity_tons: { type: DataTypes.INTEGER, allowNull: false },
    pickup_location: { type: DataTypes.STRING, allowNull: false },
    delivery_location: { type: DataTypes.STRING, allowNull: false },
    deadline: { type: DataTypes.DATEONLY, allowNull: false },
    transporter_requirements: { type: DataTypes.TEXT },
    distance_km: { type: DataTypes.FLOAT, allowNull: false },
    base_price_rupee_per_km_per_ton: { type: DataTypes.DECIMAL(10, 2) },
    status: {
      type: DataTypes.ENUM('open', 'accepted', 'closed'),
      defaultValue: 'open',
    },
  },
  {
    tableName: 'bids',
    timestamps: true,
    underscored: true,
  }
);

// Offer model
const Offer = sequelize.define(
  'Offer',
  {
    offered_price: { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    offered_price_per_km_per_ton: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    remarks: { type: DataTypes.TEXT, allowNull: true }, 
    status: {
      type: DataTypes.ENUM('open', 'accepted', 'closed'),
      defaultValue: 'open',
      allowNull: false,
    },
    bid_id: {
      type: DataTypes.INTEGER, allowNull: false,
      references: {
        model: Bid,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    
    transporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Transporter,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'offers',
    timestamps: true,    
    underscored: true,
  }
);

//Deal model
const Deal = sequelize.define(
  'Deal',
  {
    deal_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    material_type: { type: DataTypes.STRING, allowNull: false },
    quantity_tons: { type: DataTypes.INTEGER, allowNull: false },
    pickup_location: { type: DataTypes.STRING, allowNull: false },
    delivery_location: { type: DataTypes.STRING, allowNull: false },
    distance_km: { type: DataTypes.FLOAT, allowNull: false },
    deal_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    // foreign keys:
    bid_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Bid, key: 'id' },
      onDelete: 'CASCADE',
    },
    transporter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Transporter, key: 'id' },
      onDelete: 'CASCADE',
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: 'id' },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'deals',
    timestamps: true,
    underscored: true,
  }
);

//Associations

// A User can create many Bids
User.hasMany(Bid, { foreignKey: 'created_by' });
Bid.belongsTo(User, { foreignKey: 'created_by' });

// A Transporter can have many Offers
Transporter.hasMany(Offer, { foreignKey: 'transporter_id' });
Offer.belongsTo(Transporter, { foreignKey: 'transporter_id' });

// A Bid can have many Offers
Bid.hasMany(Offer, { foreignKey: 'bid_id' });
Offer.belongsTo(Bid, { foreignKey: 'bid_id' });

// A Bid can produce one Deal
Bid.hasOne(Deal, { foreignKey: 'bid_id' });
Deal.belongsTo(Bid, { foreignKey: 'bid_id' });

// A Transporter can have many Deals
Transporter.hasMany(Deal, { foreignKey: 'transporter_id' });
Deal.belongsTo(Transporter, { foreignKey: 'transporter_id' });

// A User can create many Deals
User.hasMany(Deal, { foreignKey: 'created_by' });
Deal.belongsTo(User, { foreignKey: 'created_by' });

module.exports = {
  sequelize,
  User,
  Transporter,
  Bid,
  Offer,
  Deal,
};
