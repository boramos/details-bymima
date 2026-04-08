import { ConfigService } from "@/services/ConfigService";

async function main() {
  console.log("Initializing site configurations...");

  await ConfigService.initializeDefaults();

  console.log("Site configurations initialized successfully!");
  
  const configs = await ConfigService.getMany([
    "passport_price_usd",
    "free_delivery_threshold_usd",
    "delivery_standard_usd",
    "delivery_tomorrow_usd",
    "delivery_today_usd",
    "delivery_pickup_usd",
    "tax_rate",
  ]);

  console.log("\nCurrent configurations:");
  console.table(configs);
}

main()
  .catch((error) => {
    console.error("Error initializing configurations:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
