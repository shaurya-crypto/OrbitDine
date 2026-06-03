import mongoose from "mongoose";
import connectToDatabase from "../src/lib/mongodb/db";
import User from "../src/models/User";

async function main() {
  await connectToDatabase();
  const users = await User.find();
  console.log("ALL USERS:", JSON.stringify(users, null, 2));

  process.exit(0);
}

main();
