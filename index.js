require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT;
const fileRoutes = require("./routes/file.routes");
const textRoutes = require("./routes/text.routes");
const connectDB = require("./config/db");

connectDB();
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static("uploads"));
app.use("/api/files", fileRoutes);
app.use("/api/texts", textRoutes);

const networkLocationProviders = [
  {
    name: "ip-api.com",
    url: "http://ip-api.com/json/?fields=status,message,lat,lon",
    map: (data) =>
      data.status === "success" && data.lat && data.lon
        ? {
            latitude: parseFloat(data.lat),
            longitude: parseFloat(data.lon),
          }
        : null,
  },
  {
    name: "ipinfo.io",
    url: "https://ipinfo.io/json",
    map: (data) => {
      if (!data.loc) return null;

      const [latitude, longitude] = data.loc.split(",").map(Number);

      return Number.isFinite(latitude) && Number.isFinite(longitude)
        ? { latitude, longitude }
        : null;
    },
  },
  {
    name: "geolocation-db.com",
    url: "https://geolocation-db.com/json/",
    map: (data) =>
      data.latitude && data.longitude
        ? {
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
          }
        : null,
  },
];

app.get("/api/location/network", async (req, res) => {
  const failures = [];

  try {
    for (const provider of networkLocationProviders) {
      try {
        const response = await fetch(provider.url, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Droplr/1.0",
          },
        });

        if (!response.ok) {
          failures.push(`${provider.name}: ${response.status}`);
          continue;
        }

        const data = await response.json();
        const location = provider.map(data);

        if (location) {
          return res.json({
            success: true,
            data: location,
          });
        }

        failures.push(`${provider.name}: no coordinates`);
      } catch (providerError) {
        failures.push(`${provider.name}: ${providerError.message}`);
      }
    }

    res.status(502).json({
      success: false,
      message: "Network location lookup failed",
      details: failures,
    });
  } catch (error) {
    console.error("Network location lookup error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to detect network location",
    });
  }
});
app.get("/", (req, res) => {
  res.json({ message: "Hello, from the backend of droplr!" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
