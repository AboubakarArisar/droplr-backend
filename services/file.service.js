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

exports.findNearbyFiles = async (latitude, longitude) => {
  const RANGE = 0.002; // ~200m bounding box
  const files = await File.find({
    latitude: { $gte: latitude - RANGE, $lte: latitude + RANGE },
    longitude: { $gte: longitude - RANGE, $lte: longitude + RANGE },
  });

  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000);

  return files.filter((file) => {
    const dist = haversineDistance(
      latitude,
      longitude,
      file.latitude,
      file.longitude
    );
    return dist <= 200 && new Date(file.createdAt) >= twentyMinutesAgo;
  });
};
