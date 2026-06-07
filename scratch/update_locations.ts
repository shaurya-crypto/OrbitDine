import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://orbitdine:ICheANSTY0i7otHU@orbitdibe.wut7ui4.mongodb.net/orbitdine?retryWrites=true&w=majority";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const RestaurantSchema = new mongoose.Schema({
  name: String,
  latitude: Number,
  longitude: Number,
  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number],
  },
  keywords: [String],
  cuisineType: String,
}, { strict: false });

const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", RestaurantSchema);

// Mayur Vihar Phase 3 approximate: lat: 28.6186, lng: 77.3275
// Let's create some offsets
const MOCK_COORDS = [
  { lat: 28.6186, lng: 77.3275, distance: "0km" },
  { lat: 28.6250, lng: 77.3300, distance: "~1km" },
  { lat: 28.6300, lng: 77.3400, distance: "~2km" },
  { lat: 28.6500, lng: 77.3000, distance: "~5km" },
  { lat: 28.5800, lng: 77.3100, distance: "~6km" },
];

async function run() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB.");

  const restaurants = await Restaurant.find({});
  console.log(`Found ${restaurants.length} restaurants.`);

  let i = 0;
  for (const restaurant of restaurants) {
    const coord = MOCK_COORDS[i % MOCK_COORDS.length];
    
    // Assign mock coordinates
    restaurant.latitude = coord.lat;
    restaurant.longitude = coord.lng;
    restaurant.location = {
      type: "Point",
      coordinates: [coord.lng, coord.lat], // GeoJSON is [longitude, latitude]
    };
    
    if (!restaurant.keywords || restaurant.keywords.length === 0) {
      restaurant.keywords = ["pizza", "burger", "fast food", "cafe"];
    }

    await restaurant.save();
    console.log(`Updated ${restaurant.name} with coordinates: ${coord.lat}, ${coord.lng} (${coord.distance})`);
    i++;
  }

  // Ensure index
  await Restaurant.collection.createIndex({ location: "2dsphere" });
  await Restaurant.collection.createIndex({ name: "text", keywords: "text", cuisineType: "text" });
  console.log("Indexes created.");

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch(console.error);
