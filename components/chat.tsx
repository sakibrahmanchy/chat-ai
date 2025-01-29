'use client';
import { startTransition, useEffect, useRef, useState, useTransition } from "react";
import { Input } from './ui/input';
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { collection, query, orderBy } from 'firebase/firestore';
import {  useCollection } from 'react-firebase-hooks/firestore'
import { db } from '@/firebase';
import { askQuestion } from "@/actions/ask-question";
import { Loader2Icon } from "lucide-react";
import ChatMessage from "./chat-message";

export type Message = {
    id?: string;
    role: 'human' | 'ai' | 'placeholder';
    message: string;
    createdAt: Date;
}


function Chat({ id }) {
    const { user } = useUser();
    const [input, setInput] = useState<string>();
    const [messages, setMessages] = useState<Message[]>([]);
    const bottomOfChatRef = useRef<HTMLDivElement>(null) 
    const [ isPending, statTransition] = useTransition();
    
    const [snapshot, loading, error] = useCollection(
        user && 
        query(
          collection(db, "users", user?.id, "files", id, "chat"),
          orderBy("createdAt", "asc")
        )
    )
   
    useEffect(() => {
        bottomOfChatRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    }, [messages])

    useEffect(() => {
        if (!snapshot) return;

        const lastMessage = messages.pop()
        if (lastMessage?.role === 'ai' && lastMessage?.message === 'Thinking...') {
            return;
        } 

        const newMessages = snapshot.docs.map(doc => {
            const { role, message, createdAt } = doc.data()

            return {
                id: doc.id,
                role, 
                message,
                createdAt: createdAt.toDate()
            }
        })

        setMessages(newMessages);
    }, [snapshot])

    const handleSubmit = (e) => {
        e.preventDefault();

        const q = input;

        setInput("")

        setMessages(prev => ([
            ...prev,
            {
                role: 'human',
                message: q as string,
                createdAt: new Date()
            },
            {
                role: 'ai',
                message: "Thinking...",
                createdAt: new Date()
            },
        ]))

        startTransition(async () => {
            const { success, message } = await askQuestion(id, q as string);
            if (!success) {
                setMessages((prev) => prev.slice(0, prev.length - 1).concat([
                    {
                        role: 'ai',
                        message: `Whoops...${message}`,
                        createdAt: new Date()
                    }
                ]))
            }
        });
    }

    

    return (<div className="flex flex-col h-full overflow-scroll">
        <div className="flex-1 w-full m-4">
            {loading && <div className="flex items-center justify-center">
                <Loader2Icon className="animate-spin w-20 h-20 text-indigo-600 mt-20"/>    
            </div>}
            {!loading && <div>
               {messages.length === 0 && (
                    <ChatMessage
                        key="placeholder"
                        message={{
                            role: 'ai',
                            message: 'What do you want to know about this document?',
                            createdAt: new Date()
                        }}
                    />
               )}

               {messages.map((message, index) => <ChatMessage message={message} key={index} />)}

               <div ref={bottomOfChatRef} />
            </div>}
        </div>
        <form onSubmit={handleSubmit} className="flex sticky bottom-0 space-x-2 p-5 bg-indigo-600/75 mb-12">
            <Input
                value={input}
                placeholder="Whats on your mind?"
                onChange={e => setInput(e.target.value)}
                className="bg-white"

            />

            <Button type="submit" disabled={!input || isPending}>Ask</Button>
        </form>
    </div>)
}

export default Chat;