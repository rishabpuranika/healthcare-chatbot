import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import axios from "axios";
import * as crypto from "crypto";
import "dotenv/config";

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    LM_STUDIO_URL = "http://127.0.0.1:1234"
} = process.env;

const urlsToScrape = [
    'https://en.wikipedia.org/wiki/Formula_One'
    /*'https://en.wikipedia.org/wiki/List_of_medical_symptoms',
    'https://uhs.princeton.edu/health-resources/common-illnesses',
    'https://my.clevelandclinic.org/health/diseases/16397-avoiding-healthcare-associated-infections-hais',
    'https://www.uwmedicine.org/conditions-symptoms'*/
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE });
const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 100
});

const generateEmbeddingWithLMStudio = async (text) => {
    try {
        const response = await axios.post(`${LM_STUDIO_URL}/api/v0/embeddings`, {
            input: text,
            model: "nomic-embed-text-v1.5"
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const embedding = response.data?.data?.[0]?.embedding || generateLocalEmbedding(text);
        if (embedding.length !== 768) { // Changed from 1536 to 768
            console.error("Invalid embedding size from LM Studio. Using fallback.");
            return generateLocalEmbedding(text);
        }
        return embedding;
    } catch (error) {
        console.error("Error getting embeddings from LM Studio:", error.message);
        return generateLocalEmbedding(text);
    }
};


const generateLocalEmbedding = (text) => {
    const dimension = 768; // Changed from 1536 to 768
    const embedding = new Array(dimension).fill(0);
    const normalizedText = text.toLowerCase().trim();
    const tokens = normalizedText.split(/\s+|[,.!?;:()[\]{}'"]/g).filter(token => token.length > 0);
    const tokenFreq = new Map();
    tokens.forEach(token => tokenFreq.set(token, (tokenFreq.get(token) || 0) + 1));

    tokenFreq.forEach((frequency, token) => {
        const hash = crypto.createHash('sha256').update(token).digest('hex');
        for (let i = 0; i < 8; i++) {
            const hexPart = hash.substring(i * 8, (i + 1) * 8);
            const index = parseInt(hexPart, 16) % dimension;
            embedding[index] += frequency * Math.sqrt(frequency) * (1 + (i / 10));
        }
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0)) || 1;
    return embedding.map(val => val / magnitude);
};


const createCollection = async () => {
    try {
        const collections = await db.listCollections();
        if (collections.some(collection => collection.name === ASTRA_DB_COLLECTION)) {
            console.log(`Collection ${ASTRA_DB_COLLECTION} already exists`);
            return;
        }

        await db.createCollection(ASTRA_DB_COLLECTION, {
            vector: {
                dimension: 768, // Changed from 1536 to 768
                metric: "cosine"
            }
        });
        console.log(`Collection ${ASTRA_DB_COLLECTION} created.`);
    } catch (error) {
        console.error("Error creating collection:", error.message);
    }
};


const scrapePage = async (url) => {
    try {
        const loader = new PuppeteerWebBaseLoader(url, {
            launchOptions: { headless: true },
            gotoOptions: { waitUntil: "domcontentloaded" }
        });
        return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
    } catch (error) {
        console.error(`Error scraping page ${url}:`, error.message);
        return "";
    }
};

const loadScrapedData = async () => {
    try {
        const collection = await db.collection(ASTRA_DB_COLLECTION);

        for (const url of urlsToScrape) {
            console.log(`Scraping content from ${url}`);
            const content = await scrapePage(url);
            const chunks = await splitter.splitText(content);
            console.log(`Processing ${chunks.length} chunks from ${url}`);

            for (let i = 0; i < chunks.length; i++) {
                try {
                    const vector = await generateEmbeddingWithLMStudio(chunks[i]);
                    if (vector.length !== 768) {
                        console.error("Skipping chunk due to invalid vector size:", vector.length);
                        continue;
                    }
                    await collection.insertOne({
                        $vector: vector,
                        text: chunks[i],
                        metadata: { source: url, chunkIndex: i, totalChunks: chunks.length, createdAt: new Date().toISOString() }
                    });
                    if ((i + 1) % 5 === 0) console.log(`Processed ${i + 1}/${chunks.length} chunks`);
                } catch (error) {
                    console.error(`Failed to process chunk: ${chunks[i].substring(0, 50)}...`, error.message);
                }
            }
            console.log(`Completed processing ${url}`);
        }
    } catch (error) {
        console.error("Error loading scraped data:", error.message);
    }
};

const run = async () => {
    console.log("Starting data processing pipeline");
    await createCollection();
    await loadScrapedData();
    console.log("Process completed successfully");
};

run();