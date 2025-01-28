'use server';

import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function generateEmbeddings(documentId: string) {
    auth.protect();

    await generateEmbeddingsInPineconeVectorStore(documentId);

    revalidatePath('/dashboard');

    return { completed: true }
}

