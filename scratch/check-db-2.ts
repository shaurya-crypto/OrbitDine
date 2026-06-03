import mongoose from "mongoose";
import connectToDatabase from "../src/lib/mongodb/db";
import User from "../src/models/User";

async function main() {
  await connectToDatabase();
  const testId = new mongoose.Types.ObjectId();
  const resId = new mongoose.Types.ObjectId();
  
  const newUser = await User.create({
    _id: testId,
    fullName: "Test User",
    email: "test" + Date.now() + "@test.com",
    password: "password123",
    role: "customer",
    restaurantId: resId,
  });

  console.log("CREATED USER:", JSON.stringify(newUser, null, 2));

  const fetched = await User.findById(testId);
  console.log("FETCHED USER:", JSON.stringify(fetched, null, 2));

  process.exit(0);
}

main();
