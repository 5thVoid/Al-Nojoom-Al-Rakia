import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// PATCH set address as default
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params;
        const token = request.headers.get('Authorization');

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}/default`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': token }),
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Set Default Address API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
