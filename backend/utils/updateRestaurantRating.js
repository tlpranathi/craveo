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

  if (stats.length === 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: 0,
      numberOfReviews: 0,
    });
  } else {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      averageRating: Number(stats[0].averageRating.toFixed(1)),
      numberOfReviews: stats[0].numberOfReviews,
    });
  }
};

module.exports = updateRestaurantRating;