import mongoose from "mongoose";
import connectToDatabase from "../src/lib/mongodb/db";
import User from "../src/models/User";
import Restaurant from "../src/models/Restaurant";

async function main() {
  await connectToDatabase();
  
  // Patch the owner
  const owner = await User.findOne({ email: "makeiot7@gmail.com" });
  if (owner) {
    const restaurant = await Restaurant.findOne({ ownerId: owner._id });
    if (restaurant) {
      owner.restaurantId = restaurant._id;
      await owner.save();
      console.log("Patched owner:", owner.email, "with restaurantId:", restaurant._id);
    }
  }

  // Patch the customer
  const customer = await User.findOne({ email: "shauryaprabhakar097@gmail.com" });
  if (customer && owner) {
    const restaurant = await Restaurant.findOne({ ownerId: owner._id });
    if (restaurant) {
      customer.restaurantId = restaurant._id;
      await customer.save();
      console.log("Patched customer:", customer.email, "with restaurantId:", restaurant._id);
    }
  }

  process.exit(0);
}

main();
