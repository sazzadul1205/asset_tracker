// /route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/connectDB";
import bcrypt from "bcrypt";

/**
 * PATCH Method to change a user's password
 *
 * Steps:
 * 1. Validate input (employee_id, old_password, new_password)
 * 2. Fetch the user from the database
 * 3. Verify old password matches
 * 4. Hash the new password
 * 5. Save the new password and store the old password in a history array
 */
export const PATCH = async (req, context) => {
  try {
    // Extract employee_id from URL params
    const { employee_id } = context.params;
    if (!employee_id) {
      return NextResponse.json(
        { message: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Extract old and new passwords from request body
    const { old_password, new_password } = await req.json();
    if (!old_password || !new_password) {
      return NextResponse.json(
        { message: "Old and new password required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const db = await connectDB();

    // Fetch the user from the DB using the new data format
    const user = await db
      .collection("Users")
      .findOne({ "identity.employee_id": employee_id });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Compare provided old password with hashed password in DB
    const isMatch = await bcrypt.compare(old_password, user.security?.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Old password is incorrect" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Prepare the old_passwords array, keep existing history or create new
    const oldPasswords = [
      ...(user.security?.old_passwords || []),
      user.security.password,
    ];

    // Optional: Keep only the last 5 passwords to limit array size
    const limitedOldPasswords = oldPasswords.slice(-5);

    // Update the user's password and save the old password history
    await db.collection("Users").updateOne(
      { "identity.employee_id": employee_id },
      {
        $set: {
          "security.password": hashedPassword, // New password
          "security.old_passwords": limitedOldPasswords, // Array of old passwords
          password_changed_at: new Date(), // Timestamp for password change
        },
      }
    );

    // Return success message
    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging
    console.error("Change Password Error:", error);

    // Return server error
    return NextResponse.json(
      { message: "Server error", error: error.message },
      { status: 500 }
    );
  }
};
