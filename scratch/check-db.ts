import mongoose from "mongoose";
import connectToDatabase from "../src/lib/mongodb/db";
import User from "../src/models/User";
import Restaurant from "../src/models/Restaurant";

async function main() {
  await connectToDatabase();
  const user = await User.findOne().sort({ createdAt: -1 });
  console.log("LATEST USER:", JSON.stringify(user, null, 2));

  const restaurant = await Restaurant.findOne().sort({ createdAt: -1 });
  console.log("LATEST RESTAURANT:", JSON.stringify(restaurant, null, 2));

  process.exit(0);
}

main();
