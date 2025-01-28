'use client';
import { startTransition, useEffect, useState, useTransition } from "react";
import { Input } from './ui/input';
import { Button } from "./ui/button";
import { useUser } from "@clerk/nextjs";
import { collection, query, orderBy, useCollection } from 'react-firebase-hooks'
import { db } from '@/firebase';

export type Message = {
    id?: string;
    role: 'human' | 'ai' | 'placeholder';
    message: string;
    createdAt: Date;
}


function Chat({ id }) {
    const { user } = useUser();
    const [input, setInput] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [ isPending, statTransition] = useTransition();
    
    const [snapshot, loading, error] = useCollection(
        user && 
        query(
          collection(db, "users", user?.id, "files", id, "chat"),
          orderBy("createdAt", "asc")
        )
    )
   

    useEffect(() => {
        if (!snapshot) return;

    }, [snapshot])

    const handleSubmit = (e) => {
        e.preventDefault();

        const q = input;

        setMessages(
            ...prev,
            {
                role: 'human',
                message: q,
                createdAt: new Date()
            },
            {
                role: 'ai',
                message: "Thinking...",
                createdAt: new Date()
            },
        )

        startTransition(async () => {
            const [success, message] = await askQuestion(id, q);
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
        <div className="flex-1 w-full"></div>
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