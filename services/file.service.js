const File = require("../models/file.model");

exports.createFile = async (fileData) => {
  return await File.create(fileData);
};

exports.deleteFile = async (fileId) => {
  return await File.findByIdAndDelete(fileId);
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radius of Earth in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // distance in meters
};

// Calculate dynamic bounding box based on latitude
const calculateBoundingBox = (latitude, longitude, radiusMeters = 200) => {
  // Convert radius from meters to degrees
  // At the equator: 1 degree ≈ 111,320 meters
  // At other latitudes: 1 degree longitude ≈ 111,320 * cos(latitude) meters
  const latDelta = radiusMeters / 111320; // ~1.8 meters per degree latitude
  const lonDelta =
    radiusMeters / (111320 * Math.cos((latitude * Math.PI) / 180)); // Varies by latitude

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLon: longitude - lonDelta,
    maxLon: longitude + lonDelta,
  };
};

exports.findNearbyFiles = async (latitude, longitude, userAccuracy = null) => {
  // Adjust search radius based on user's location accuracy
  let searchRadius = 200; // Default 200m radius

  if (userAccuracy) {
    // If user's location accuracy is poor, increase search radius
    if (userAccuracy > 100) {
      searchRadius = Math.min(500, 200 + userAccuracy); // Cap at 500m
    }
  }

  // Calculate dynamic bounding box
  const bbox = calculateBoundingBox(latitude, longitude, searchRadius);

  const files = await File.find({
    latitude: { $gte: bbox.minLat, $lte: bbox.maxLat },
    longitude: { $gte: bbox.minLon, $lte: bbox.maxLon },
  });

  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

  // Filter files by exact distance and add distance information
  const nearbyFiles = files
    .filter((file) => {
      const dist = haversineDistance(
        latitude,
        longitude,
        file.latitude,
        file.longitude
      );
      return (
        dist <= searchRadius && new Date(file.createdAt) >= twentyMinutesAgo
      );
    })
    .map((file) => {
      const distance = haversineDistance(
        latitude,
        longitude,
        file.latitude,
        file.longitude
      );
      return {
        ...file.toObject(),
        distance: Math.round(distance),
      };
    })
    .sort((a, b) => a.distance - b.distance); // Sort by distance

  return nearbyFiles;
};
