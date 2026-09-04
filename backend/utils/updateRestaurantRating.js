const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

const updateRestaurantRating = async (restaurantId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        restaurant: restaurantId,
      },
    },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
        numberOfReviews: { $sum: 1 },
      },
    },
  ]);

  const updated = stats.length === 0
    ? { averageRating: 0, numberOfReviews: 0 }
    : { averageRating: Number(stats[0].averageRating.toFixed(1)), numberOfReviews: stats[0].numberOfReviews };

  await Restaurant.findByIdAndUpdate(restaurantId, updated);
  return updated;
};

module.exports = updateRestaurantRating;