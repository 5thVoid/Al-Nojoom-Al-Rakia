import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET specific address by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params;
        const token = request.headers.get('Authorization');

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': token }),
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Get Address API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// PUT update address
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params;
        const token = request.headers.get('Authorization');
        const body = await request.json();

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': token }),
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Update Address API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

// DELETE address
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ addressId: string }> }
) {
    try {
        const { addressId } = await params;
        const token = request.headers.get('Authorization');

        const response = await fetch(`${API_URL}/api/v1/addresses/${addressId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': token }),
            },
        });

        const data = await response.json();

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Delete Address API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
