export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// app/api/contact/route.ts
import { NextResponse } from 'next/server';

type ContactFormData = {
  personalInformation: {
    firstName: string;
    lastName: string;
    mobile: string;
    email: string;
  };
  howDidYouFindUs: {
    FindUs: string;
    FindUsOther?: string;
  };
  industryInformation: {
    industry: string;
    businessStatus: string;
    deployment: string;
  };
  message: string;
  layoutPdfUrl?: string;
};

export async function POST(request: Request) {
  const API_URL =
    process.env.WORKORG_CONTACT_API_URL ||
    "https://ws6.workorgm.com/WorkAPI/ipdc/PostJson?jsonName=IPDC_PUTTBROTHERS_Contact"
  const API_TOKEN = process.env.WORKORG_API_TOKEN

  if (!API_TOKEN) {
    console.error("WORKORG_API_TOKEN is not configured")
    return NextResponse.json(
      { success: false, message: "Contact service is not configured" },
      { status: 500 },
    )
  }

  try {
    const data: ContactFormData = await request.json();

    // Basic validation
    // if (!data?.personalInformation?.firstName || 
    //     !data?.personalInformation?.email || 
    //     !data?.serviceService?.Service) {
    //   return NextResponse.json(
    //     { success: false, message: 'Missing required fields' },
    //     { status: 400 }
    //   );
    // }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        personalInformation: {
          firstName: data.personalInformation.firstName,
          lastName: data.personalInformation.lastName,
          mobile: data.personalInformation.mobile,
          email: data.personalInformation.email
        },
        howDidYouFindUs: {
          FindUs: data.howDidYouFindUs.FindUs,
          FindUsOther: data.howDidYouFindUs.FindUsOther || ''
        },
        industryInformation: {
          industry: data.industryInformation.industry,
          businessStatus: data.industryInformation.businessStatus,
          deployment: data.industryInformation.deployment
        },
        message: data.message,
        layoutPdfUrl: data.layoutPdfUrl || ''
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false, 
          message: `API error: ${response.statusText}`,
          details: process.env.NODE_ENV === "development" ? errorText : undefined
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Form submitted successfully!' 
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
