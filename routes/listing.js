const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingcontroller = require("../controllers/listings.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

router
  .route("/")
  .get(wrapAsync(listingcontroller.index))
  .post(
    isLoggedIn,
    upload.single("image"),
    (req, res, next) => {
      if (req.file) {
        req.body.image = {
          url: req.file.path,
          filename: req.file.filename,
        };
      }
      next();
    },
    validateListing,
    wrapAsync(listingcontroller.createListing)
  );

// New route
router.get("/new", isLoggedIn, listingcontroller.renderNewForm);

router
  .route("/:id")
  .get(wrapAsync(listingcontroller.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("image"),
    validateListing,
    wrapAsync(listingcontroller.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingcontroller.destroyListing));

// Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingcontroller.renderEditForm)
);

module.exports = router;
