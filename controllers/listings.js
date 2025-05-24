const fetch = require("node-fetch");
const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  try {
    const listing = new Listing(req.body);

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    listing.owner = req.user._id;
    await listing.save();

    req.flash("success", "New listing created!");
    res.redirect(`/listings`);
  } catch (err) {
    console.error("Error creating listing:", err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
  }
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }

  let orignalImageUrl = listing.image.url;

  orignalImageUrl = orignalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, orignalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listings");
    }

    if (req.body.location && req.body.location !== listing.location) {
      const place = req.body.location;
      const nominatimUrl =
        `https://nominatim.openstreetmap.org/search` +
        `?q=${encodeURIComponent(place)}` +
        `&format=json&limit=1`;

      const geoRes = await fetch(nominatimUrl, {
        headers: { "User-Agent": "wanderlust-app/1.0 (you@example.com)" },
      });
      const geoData = await geoRes.json();

      if (!geoData.length) {
        req.flash("error", "Unable to geocode the new location");
        return res.redirect(`/listings/${id}/edit`);
      }

      const lat = parseFloat(geoData[0].lat);
      const lon = parseFloat(geoData[0].lon);
      listing.geometry = {
        type: "Point",
        coordinates: [lon, lat],
      };

      listing.location = place;
    }

    Object.assign(listing, req.body);

    if (req.file) {
      listing.image = {
        url: req.file.path,
        filename: req.file.filename,
      };
    }

    await listing.save();

    req.flash("success", "Listing updated!");
    res.redirect(`/listings/${id}`);
  } catch (err) {
    console.error("Error updating listing:", err);
    req.flash("error", "Something went wrong on update");
    res.redirect("/listings");
  }
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
