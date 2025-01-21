import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req) {
    try {
      // جلب جميع المستخدمين من قاعدة البيانات
      const users = await prisma.user.findMany();
  
      // التحقق إذا كانت البيانات موجودة
      if (!users || users.length === 0) {
        return new Response(JSON.stringify({ message: 'No users found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // إرسال المستخدمين كاستجابة
      return new Response(JSON.stringify(users), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching users:', error.message);
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // التحقق من وجود البيانات
    if (!body || !body.name || !body.email || !body.password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { name, email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
