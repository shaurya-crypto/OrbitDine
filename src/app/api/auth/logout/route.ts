import { NextResponse } from "next/server";

export async function POST() {
  // We can optionally delete the session from DB here if we receive the refresh token

  const response = NextResponse.json({ message: "Logged out successfully" });
  
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
  
  return response;
}
