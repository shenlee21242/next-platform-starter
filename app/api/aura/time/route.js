export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    return Response.json(
        { time: new Date().toISOString(), source: 'server' },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
    );
}
