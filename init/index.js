const mongoose = require('mongoose');
const initData = require('./data.js');
const Listing = require('../models/listing.js');
const { geocodeLocation, DEFAULT_GEOMETRY } = require('../utils/geocode');

const MONGO_URL = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';

main()
  .then(() => {
    console.log('connected to DB');
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const listingsWithOwner = await Promise.all(
    initData.data.map(async (obj) => ({
      ...obj,
      owner: '682c00b961f1ccc75ee0fc93',
      geometry: (await geocodeLocation(obj.location, obj.country)) || DEFAULT_GEOMETRY,
    }))
  );

  await Listing.insertMany(listingsWithOwner);
  console.log('data was initialized');
  await mongoose.connection.close();
};

initDB();
