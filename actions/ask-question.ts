'use server';

import { Message } from "@/components/chat";
import { adminDb } from "@/firebase-admin";
import { generateLangChainCompletion } from "@/lib/langchain";
import { auth } from "@clerk/nextjs/server";

const FREE_LIMIT = 3;
const PRO_LIMIT = 100;

export async function askQuestion(id: string, question: string) {
    auth.protect();
    const { userId } = await auth();

    if (!userId) {
        throw new Error("User not found");
    }

    const chatRef = await adminDb
    .collection("users")
    .doc(userId)
    .collection("files")
    .doc(id)
    .collection('chat')

    const chatSnapShot = await chatRef.get();
    const userMessages = chatSnapShot.docs.filter(
        doc => doc.data().role === 'human'
    )

    const userMessage: Message = {
        role: 'human',
        message: question,
        createdAt: new Date()
    };

    await chatRef.add(userMessage);

    const reply = await generateLangChainCompletion(id, question)

    const aiMessage: Message = {
        role: 'ai',
        message: reply,
        createdAt: new Date()
    };

    await chatRef.add(aiMessage);

    return { success: true, message: null }
}