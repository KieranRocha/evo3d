// app/api/cleanup-temp-files/route.js
import { NextResponse } from "next/server";
import { deleteTempFile } from "../../firebase/storage";

export async function POST(request) {
  try {
    // Read the JSON data from the request body
    const data = await request.json();

    if (!Array.isArray(data)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format, expected array of paths",
        },
        { status: 400 }
      );
    }

    // Process file deletions
    const results = await Promise.all(
      data.map(async (path) => {
        try {
          await deleteTempFile(path);
          return { path, success: true };
        } catch (error) {
          console.error(`Failed to delete ${path}:`, error);
          return { path, success: false, error: error.message };
        }
      })
    );

    // Count successes and failures
    const successes = results.filter((result) => result.success).length;
    const failures = results.length - successes;

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} files. ${successes} deleted successfully, ${failures} failed.`,
      results,
    });
  } catch (error) {
    console.error("Error processing cleanup request:", error);

    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
