// import { seed } from "drizzle-seed";
// import { Database } from "../db";
// import { people, apps, organisationalUnits, ratings} from "./schema";

// async function main() {
// 	try {
// 		console.log("Starting database seeding...");
// 		const { db, connected, connectionMsg } = new Database("appimate_Appimate");
// 		console.log(`✅ DB Connected: ${connected}; ${connectionMsg}\n`);

// 		console.log("🔄 Starting People Table Seeding...");
// 		await seed(db, people, { count: 10 }).then(() => {
// 			console.log("✅ People Table Seeding Completed Successfully!");
// 			// Exit process with success code
// 		}).catch((error) => {
// 			console.error("❌ Error seeding database:", error);
// 			process.exit(1);
// 		});

// 		console.log("🔄 Starting Organisational Units Table Seeding...");
// 		await seed(db, organisationalUnits, { count: 10 }).then(() => {
// 			console.log("✅ Organisational Units Table Seeding Completed Successfully!");
// 			// Exit process with success code
// 		}).catch((error) => {
// 			console.error("❌ Error seeding database:", error);
// 			process.exit(1);
// 		});

// 		console.log("🔄 Starting Apps Table Seeding...");
// 		await seed(db, apps, { count: 10 }).then(() => {
// 			console.log("✅ Apps Table Seeding Completed Successfully!");
// 			// Exit process with success code
// 		}).catch((error) => {
// 			console.error("❌ Error seeding database:", error);
// 			process.exit(1);
// 		});

// 		console.log("🔄 Starting Ratings Table Seeding...");
// 		await seed(db, ratings, { count: 10 }).then(() => {
// 			console.log("✅ Ratings Table Seeding Completed Successfully!");
// 			// Exit process with success code
// 		}).catch((error) => {
// 			console.error("❌ Error seeding database:", error);
// 			process.exit(1);
// 		});

// 		console.log(`\n✅✅✅ All Database Seeding Completed Successfully!`);
// 		process.exit(0);
// 	} catch (error) {
// 		console.error("❌ Error seeding database:", error);
// 		process.exit(1);
// 	}
// }

// main();
