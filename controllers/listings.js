const Listing = require('../models/listing');
const { CATEGORY_OPTIONS, CATEGORY_SLUGS, inferCategory } = require('../utils/categoryData');
const { geocodeLocation, DEFAULT_GEOMETRY } = require('../utils/geocode');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports.index = async (req, res) => {
  const activeCategory = CATEGORY_SLUGS.includes(req.query.category) ? req.query.category : '';
  const searchQuery = (req.query.q || '').trim();

  const query = {};

  if (activeCategory) {
    query.category = activeCategory;
  }

  if (searchQuery) {
    const regex = new RegExp(escapeRegex(searchQuery), 'i');
    query.$or = [
      { title: regex },
      { location: regex },
      { country: regex },
      { description: regex },
    ];
  }

  const allListings = await Listing.find(query).sort({ createdAt: -1 });

  res.render('listings/index.ejs', {
    allListings,
    filters: CATEGORY_OPTIONS,
    activeCategory,
    searchQuery,
    resultCount: allListings.length,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render('listings/new.ejs', {
    categories: CATEGORY_OPTIONS,
  });
};

module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: 'reviews',
      populate: {
        path: 'author',
      },
    })
    .populate('owner');

  if (!listing) {
    req.flash('error', 'Listing you requested for does not exist!');
    return res.redirect('/listings');
  }

  if (!listing.category) {
    listing.category = inferCategory(listing);
  }

  const hasValidGeometry =
    listing.geometry &&
    Array.isArray(listing.geometry.coordinates) &&
    listing.geometry.coordinates.length === 2 &&
    listing.geometry.coordinates.every((value) => Number.isFinite(value));

  if (!hasValidGeometry) {
    const geometry = (await geocodeLocation(listing.location, listing.country)) || DEFAULT_GEOMETRY;
    listing.geometry = geometry;
    try {
      await listing.save();
    } catch (err) {
      console.warn('Could not save repaired geometry:', err.message);
    }
  }

  res.render('listings/show.ejs', { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    const listing = new Listing(req.body);

    if (!listing.category) {
      listing.category = inferCategory(listing);
    }

    listing.geometry = (await geocodeLocation(listing.location, listing.country)) || DEFAULT_GEOMETRY;

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    listing.owner = req.user._id;
    await listing.save();

    req.flash('success', 'New listing created!');
    res.redirect('/listings');
  } catch (err) {
    console.error('Error creating listing:', err);
    req.flash('error', 'Something went wrong!');
    res.redirect('/listings');
  }
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash('error', 'Listing you requested for does not exist!');
    return res.redirect('/listings');
  }

  let orignalImageUrl = listing.image?.url || '';
  if (orignalImageUrl) {
    orignalImageUrl = orignalImageUrl.replace('/upload', '/upload/w_250');
  }

  res.render('listings/edit.ejs', {
    listing,
    orignalImageUrl,
    categories: CATEGORY_OPTIONS,
  });
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      req.flash('error', 'Listing not found!');
      return res.redirect('/listings');
    }

    const nextLocation = req.body.location?.trim();
    const nextCountry = req.body.country?.trim();
    const shouldRefreshGeometry =
      (nextLocation && nextLocation !== listing.location) ||
      (nextCountry && nextCountry !== listing.country) ||
      !listing.geometry ||
      !Array.isArray(listing.geometry.coordinates) ||
      listing.geometry.coordinates.length !== 2;

    Object.assign(listing, req.body);

    if (shouldRefreshGeometry) {
      listing.geometry = (await geocodeLocation(listing.location, listing.country)) || DEFAULT_GEOMETRY;
    }

    if (!listing.category) {
      listing.category = inferCategory(listing);
    }

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();

    req.flash('success', 'Listing updated!');
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error('Error updating listing:', err);
    req.flash('error', 'Something went wrong on update');
    res.redirect('/listings');
  }
};

module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash('success', 'Listing Deleted!');
  res.redirect('/listings');
};
