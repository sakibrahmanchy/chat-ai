import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import React, { JSX } from "react";
import Link from "next/link";

export default function HeaderView({
    title,
    description,
    backText,
    link,
    children
}: {
    title: string;
    description: string;
    backText: string;
    link: string;
    children: JSX.Element
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href={link}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {backText}
                            </Button>
                        </Link>
                    </div>
                    <h1 className="text-2xl font-semibold">{title}</h1>
                    <p className="text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>

            {children}
        </div>
    )
}
