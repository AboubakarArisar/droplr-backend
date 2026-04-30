const Text = require("../models/text.model");

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const calculateBoundingBox = (latitude, longitude, radiusMeters = 200) => {
  const latDelta = radiusMeters / 111320;
  const lonDelta = radiusMeters / (111320 * Math.cos((latitude * Math.PI) / 180));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
};

exports.createText = async (textData) => {
  return await Text.create(textData);
};

exports.deleteText = async (textId) => {
  return await Text.findByIdAndDelete(textId);
};

exports.findNearbyTexts = async (latitude, longitude, userAccuracy = null) => {
  let searchRadius = 200;

  if (userAccuracy && userAccuracy > 100) {
    searchRadius = Math.min(500, 200 + userAccuracy);
  }

  const bbox = calculateBoundingBox(latitude, longitude, searchRadius);
  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

  const texts = await Text.find({
    latitude: { $gte: bbox.minLat, $lte: bbox.maxLat },
    longitude: { $gte: bbox.minLon, $lte: bbox.maxLon },
    createdAt: { $gte: twentyMinutesAgo },
  });

  return texts
    .map((text) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        text.latitude,
        text.longitude
      );

      const { _id, content, createdAt } = text.toObject();

      return {
        _id,
        content,
        createdAt,
        distance: Math.round(distance),
      };
    })
    .filter((text) => text.distance <= searchRadius)
    .sort((a, b) => a.distance - b.distance);
};
