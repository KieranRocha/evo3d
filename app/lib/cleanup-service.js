// app/lib/cleanup-service.js
import { deleteTempFile } from "../firebase/storage";

/**
 * Cleans up unused Firebase Storage files from completed orders
 */
export async function cleanupCompletedOrderFiles() {
  try {
    // Get paths from localStorage
    const firebasePaths = JSON.parse(
      localStorage.getItem("firebasePaths") || "[]"
    );

    if (firebasePaths.length === 0) {
      return;
    }

    // Process deletions in smaller batches to avoid overwhelming the network
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < firebasePaths.length; i += batchSize) {
      batches.push(firebasePaths.slice(i, i + batchSize));
    }

    // Process each batch
    for (const batch of batches) {
      await Promise.all(
        batch.map((path) =>
          deleteTempFile(path).catch((err) => {
            console.error(`Failed to delete file ${path}:`, err);
            return false;
          })
        )
      );
    }

    // Clear the list after successful cleanup
    localStorage.removeItem("firebasePaths");

    console.log(
      `Cleaned up ${firebasePaths.length} temporary files from Firebase Storage`
    );
  } catch (error) {
    console.error("Error cleaning up Firebase files:", error);
  }
}

/**
 * Initialize cleanup service to run on page unload and periodically
 */
export function initCleanupService() {
  // Run cleanup on page unload
  window.addEventListener("beforeunload", () => {
    const pendingCleanup = localStorage.getItem("firebasePaths");
    if (pendingCleanup) {
      navigator.sendBeacon("/api/cleanup-temp-files", pendingCleanup);
    }
  });

  // Periodically check and clean up old files (every 30 minutes)
  setInterval(() => {
    cleanupCompletedOrderFiles();
  }, 30 * 60 * 1000);

  // Initial cleanup when page loads
  cleanupCompletedOrderFiles();
}
