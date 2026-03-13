const mongoose = require('mongoose');
const Review = require('./review.js');
const { CATEGORY_SLUGS, inferCategory } = require('../utils/categoryData');
const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      url: {
        type: String,
      },
      filename: {
        type: String,
      },
    },
    price: {
      type: Number,
    },
    location: {
      type: String,
    },
    country: {
      type: String,
    },
    category: {
      type: String,
      enum: CATEGORY_SLUGS,
      default: 'trending',
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    geometry: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
  },
  { timestamps: true }
);

listingSchema.pre('save', function assignCategory(next) {
  if (!this.category) {
    this.category = inferCategory(this);
  }
  next();
});

listingSchema.post('findOneAndDelete', async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model('Listing', listingSchema);

module.exports = Listing;
