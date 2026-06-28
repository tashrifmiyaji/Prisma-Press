import app from "./app";
import config from "./config";
import { prisma } from "./lib/prisma";

const port = config.port;

const main = async () => {
	try {
		await prisma.$connect();
		console.log("database connect successfully!");

		app.listen(port, () => {
			console.log(`server running on http://localhost:${port}`);
		});
	} catch (error) {
		console.error("error starting server", error);
		await prisma.$disconnect();
		process.exit(1);
	}
};
main();
