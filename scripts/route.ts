import { DataAPIClient } from "@datastax/astra-db-ts"
import axios from "axios"
import dotenv from "dotenv"
dotenv.config()

const {
    ASTRA_DB_NAMESPACE,
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    LM_STUDIO_URL = "http://127.0.0.1:1234"
} = process.env;

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN)
const db = client.db(ASTRA_DB_API_ENDPOINT, { namespace: ASTRA_DB_NAMESPACE })

// Function to get embeddings from LM Studio using the correct endpoint
async function getEmbeddings(text: string) {
    try {
        const response = await axios.post(`${LM_STUDIO_URL}/api/v0/embeddings`, {
            input: text,
            model: "nomic-embed-text-v1.5" // Using the same model from your scraper
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        return response.data?.data?.[0]?.embedding;
    } catch (error) {
        console.error("Error getting embeddings from LM Studio:", error.message);
        // You might want to implement a fallback like your generateLocalEmbedding function
        throw error;
    }
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const latestMessage = messages[messages?.length - 1]?.content

        const isMedicalQuery = (message: string): boolean => {
            const medicalKeywords = [
                "symptom", "disease", "illness", "condition", "treatment",
                "diagnosis", "medicine", "health", "doctor", "patient"
            ];
            return medicalKeywords.some(keyword => message.toLowerCase().includes(keyword));
        };

        if (!isMedicalQuery(latestMessage)) {
            return new Response(JSON.stringify({
                error: "The query is not related to the medical field. Please ask a medical-related question."
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        let docContext = ""

        try {
            // Get embeddings using LM Studio with the correct embedding model
            const embedding = await getEmbeddings(latestMessage);

            if (!embedding || embedding.length !== 768) {
                throw new Error("Invalid embedding received");
            }

            const collection = await db.collection(ASTRA_DB_COLLECTION)
            const cursor = collection.find(null, {
                sort: {
                    $vector: embedding,
                },
                limit: 10
            })

            const documents = await cursor.toArray()

            const docsMap = documents?.map(doc => doc.text)

            docContext = JSON.stringify(docsMap)

        } catch (err) {
            console.log("Error querying Astra DB or getting embeddings", err)
            docContext = ""
        }

        const template = {
            role: "system",
            content: `You are an AI assistant who knows everything about medical diseases and their symptoms.
            Use the below context to augment what you know about medical diseases.
            
            IMPORTANT: Format your responses using proper markdown:
            - Always use bullet points with "• " prefix for listing symptoms
            - Put each symptom on its own line
            - Use proper markdown headers for sections (## or ###)
            - Separate paragraphs with empty lines
            
            Common symptoms should be formatted like this:
            • Symptom 1
            • Symptom 2
            • Symptom 3
            
            If the context doesn't include the information you need, respond based on your existing knowledge and don't mention the source of information.

            If the context is not relevant to medical field, respond with "I cant answer that question as it is not related to medical field".
            ------------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            ------------------
            QUESTION: ${latestMessage}
            ------------------
            `
        }

        // Use LM Studio API for chat completions with the correct model based on your front-end
        const response = await fetch(`${LM_STUDIO_URL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "TheBloke/Llama-2-7B-Chat-GGUF", // Using the model specified in your frontend
                messages: [template, ...messages],
                temperature: 0.7,
                max_tokens: 500,
                stream: true
            })
        });

        // Create a streaming response
        return new Response(response.body, {
            headers: {
                'Content-Type': 'text/event-stream'
            }
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}