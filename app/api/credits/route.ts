import { creditService } from "@/lib/services/credits.service";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // const { userId } = await auth();
    // if (!userId) {
    //     return new NextResponse("Unauthorized", { status: 401 });
    // }

    const { packageId, companyId } = await req.json();

    if (!packageId && !companyId) {
        return new NextResponse("Invalid request", { status: 400 });
    }

    await creditService.addCreditPackageToCompany(companyId, packageId);
    

}