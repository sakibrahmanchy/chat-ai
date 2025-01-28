import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"
import { OpenAIEmbeddings } from "@langchain/openai";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { adminDb } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

const model = new ChatOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o'
})


export const indexName = "chatai";

export async function generateDocs(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    const firebaseRef = adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(docId)
    .get();

    const downloadUrl = (await firebaseRef).data()?.downloadUrl;

    if (!downloadUrl) {
        throw new Error("Download url not found");
    }

    const response = await fetch(downloadUrl);

    const data = await response.blob();

    const loader = new PDFLoader(data);
    const docs = await loader.load();

    //Split the PDF into chunks 
    const splitter = new RecursiveCharacterTextSplitter()
    const splitDocs = await splitter.splitDocuments(docs);

    return splitDocs;
}

async function namespaceExists(index: Index<RecordMetadata>, namespace: string) {
    if (!namespace) throw new Error("No namespace value provided");

    const { namespaces } =  await index.describeIndexStats();
    return namespaces?.[namespace] !== undefined;
}

export async function generateEmbeddingsInPineconeVectorStore(docId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    let pineconeVectorStore;

    console.log("----Generating embeddings for the split documents----");

    const embeddings = new OpenAIEmbeddings();

    const index = await pineconeClient.Index(indexName);
    const namespaceAlreadyExists = await namespaceExists(index, docId);
    
    if (namespaceAlreadyExists) {
        console.log(`---Namespace ${docId} already exists, reusing existing embeddings---`);

        pineconeVectorStore = await PineconeStore.fromExistingIndex(embeddings, {
            pineconeIndex: index,
            namespace: docId
        })
    } else {
        const splitDocs = await generateDocs(docId);

        pineconeVectorStore = await PineconeStore.fromDocuments(
            splitDocs, 
            embeddings,
            {
                pineconeIndex: index,
                namespace: docId
            } 
        )
    }

    return pineconeVectorStore;
}