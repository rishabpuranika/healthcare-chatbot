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
            // First check if the message is too short or contains only special characters/numbers
            if (!message || message.length < 3 || /^[^a-zA-Z]*$/.test(message)) {
                return false;
            }

            const medicalKeywords = [
                // General health terms
                "health", "medical", "doctor", "patient", "hospital", "clinic",
                // Symptoms and conditions
                "symptom", "disease", "illness", "condition", "disorder", "syndrome",
                // Treatment related
                "treatment", "medicine", "medication", "drug", "therapy", "cure",
                // Body parts and systems
                "heart", "lung", "brain", "blood", "bone", "muscle", "skin",
                // Common medical procedures
                "surgery", "operation", "diagnosis", "test", "scan", "x-ray",
                // Mental health
                "mental", "psychology", "depression", "anxiety", "stress",
                // Lifestyle and prevention
                "diet", "exercise", "nutrition", "vitamin", "sleep", "fitness",
                // Emergency and first aid
                "emergency", "first aid", "injury", "wound", "pain"
            ];

            const messageLower = message.toLowerCase().trim();

            // Check if the message contains any medical keywords
            const hasMedicalKeyword = medicalKeywords.some(keyword => messageLower.includes(keyword));

            // Additional check for common non-medical patterns
            const nonMedicalPatterns = [
                /^[0-9]+$/,  // Only numbers
                /^[^a-zA-Z0-9]+$/,  // Only special characters
                /^[a-z]{1,2}$/,  // Very short words
                /^[a-z]+[0-9]+$/,  // Words followed by numbers only
                /^[0-9]+[a-z]+$/   // Numbers followed by words only
            ];

            const hasNonMedicalPattern = nonMedicalPatterns.some(pattern => pattern.test(messageLower));

            return hasMedicalKeyword && !hasNonMedicalPattern;
        };

        if (!isMedicalQuery(latestMessage)) {
            return new Response(JSON.stringify({
                error: "I can only answer questions related to healthcare and medical topics. Please ask a health-related question."
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
            content: `You are an AI healthcare assistant specialized in medical information and health advice.
            Your primary role is to provide accurate and helpful information about health-related topics.
            
            IMPORTANT RULES:
            1. ONLY respond to questions related to healthcare, medical conditions, treatments, or health advice
            2. If a question is not related to healthcare, respond with: "I can only answer questions related to healthcare and medical topics. Please ask a health-related question."
            3. Always maintain a professional and medical tone
            4. When providing medical information, include appropriate disclaimers about consulting healthcare professionals
            
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

            If the context is not relevant to medical field, respond with "I can only answer questions related to healthcare and medical topics. Please ask a health-related question."
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