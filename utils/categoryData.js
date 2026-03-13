const CATEGORY_OPTIONS = [
  { slug: 'trending', label: 'Trending', icon: 'fa-solid fa-fire' },
  { slug: 'rooms', label: 'Rooms', icon: 'fa-solid fa-bed' },
  { slug: 'iconic-cities', label: 'Iconic Cities', icon: 'fa-solid fa-mountain-city' },
  { slug: 'mountains', label: 'Mountains', icon: 'fa-solid fa-mountain' },
  { slug: 'castles', label: 'Castles', icon: 'fa-brands fa-fort-awesome' },
  { slug: 'amazing-pools', label: 'Amazing Pools', icon: 'fa-solid fa-person-swimming' },
  { slug: 'camping', label: 'Camping', icon: 'fa-solid fa-campground' },
  { slug: 'farms', label: 'Farms', icon: 'fa-solid fa-tractor' },
  { slug: 'boats', label: 'Boats', icon: 'fa-solid fa-ship' },
  { slug: 'wildlife-safaris', label: 'Wildlife Safaris', icon: 'fa-solid fa-paw' },
  { slug: 'romantic-getaways', label: 'Romantic Getaways', icon: 'fa-solid fa-heart' },
];

const CATEGORY_SLUGS = CATEGORY_OPTIONS.map((option) => option.slug);

function inferCategory(listing = {}) {
  const text = `${listing.title || ''} ${listing.description || ''} ${listing.location || ''} ${listing.country || ''}`.toLowerCase();

  if (/(safari|serengeti|wild)/.test(text)) return 'wildlife-safaris';
  if (/(castle|palace|fort)/.test(text)) return 'castles';
  if (/(pool|villa|bungalow|maldives|phuket|bali)/.test(text)) return 'amazing-pools';
  if (/(camp|cabin|lake|treehouse|retreat|chalet|ski|mountain|banff|aspen|montana)/.test(text)) return 'mountains';
  if (/(farm|cotswolds|cottage|countryside)/.test(text)) return 'farms';
  if (/(boat|island|overwater|beachfront|beach house|beach|coast|malibu|cancun|mykonos|fiji|bali|maldives)/.test(text)) return 'boats';
  if (/(new york|tokyo|amsterdam|miami|los angeles|boston|charleston|downtown|city|apartment|loft|penthouse)/.test(text)) return 'iconic-cities';
  if (/(romantic|honeymoon|tuscany|cotswolds|private island|canal house)/.test(text)) return 'romantic-getaways';
  if (/(room|apartment|loft|penthouse|brownstone)/.test(text)) return 'rooms';
  return 'trending';
}

module.exports = {
  CATEGORY_OPTIONS,
  CATEGORY_SLUGS,
  inferCategory,
};
