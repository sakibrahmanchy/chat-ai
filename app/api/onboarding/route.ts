import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const { userId,  } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();
    const userDetails = await currentUser();

    console.log(data)
    // First create the company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        name: data.companyName,
        website: data.website || null,
        industry: data.industry,
        size: data.size,
        location: data.address.city + ', ' + data.address.state + ', ' + data.address.country,
      })
      .select()
      .single();

      console.log({
        companyError
      })

    if (companyError) throw companyError;

    // // Then create the address
    // const { data: address, error: addressError } = await supabase
    //   .from('addresses')
    //   .insert({
    //     street: data.address.street,
    //     city: data.address.city,
    //     state: data.address.state,
    //     country: data.address.country,
    //     postal_code: data.address.postalCode,
    //     company_id: company.id
    //   })
    //   .select()
    //   .single();

    // if (addressError) throw addressError;

    // Update user with additional info
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: userDetails?.emailAddresses[0].emailAddress,
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber,
        company_id: company.id,
        onboarding_completed: true
      })
      .eq('id', userId);

    if (userError) throw userError;

    return NextResponse.json({
      message: "Onboarding completed successfully",
      companyId: company.id
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 