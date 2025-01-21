export async function POST() {
    return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
      status: 200,
      headers: {
        'Set-Cookie': `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure;`,
        'Content-Type': 'application/json',
      },
    });
  }
  