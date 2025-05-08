import { DataAPIClient } from "@datastax/astra-db-ts";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

const {
    ASTRA_DB_APPLICATION_TOKEN,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_NAMESPACE
} = process.env;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });

(async () => {
    try {
        const collections = await db.listCollections();
        console.log("Successfully connected to Astra DB:", collections);
        console.log("Aplication Token:", ASTRA_DB_APPLICATION_TOKEN);
    } catch (err) {
        console.error("Error connecting to Astra DB:", err);
    }
})();