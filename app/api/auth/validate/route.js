import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    // قراءة الكوكيز من الهيدر
    const cookies = req.headers.get('cookie') || '';
    const token = cookies
      .split('; ')
      .find((cookie) => cookie.startsWith('token='))
      ?.split('=')[1];
    if (!token) {
      return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
    }

    jwt.verify(token, SECRET_KEY); // فك التوكن للتحقق من صحته
    return new Response(JSON.stringify({ isAuthenticated: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ isAuthenticated: false }), { status: 200 });
  }
}
