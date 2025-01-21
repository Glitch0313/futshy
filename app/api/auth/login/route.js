// import prisma from '../../../../lib/prisma';
// import bcrypt from 'bcryptjs';

// export async function POST(req) {
//   try {
//     const { email, password } = await req.json();
//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
//         status: 401,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     return new Response(JSON.stringify({ id: user.id, name: user.name }), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error(error);
//     return new Response(JSON.stringify({ error: 'Failed to login' }), { status: 500 });
//   }
// }


import prisma from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({ where: { email } });

    // التحقق من بيانات المستخدم
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return new Response(JSON.stringify({ error: 'Invalid email or password' }), {
        status: 401,
      });
    }

    // إنشاء التوكن
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: '1h', // مدة صلاحية التوكن
    });

    const tyu = user.id;
    // إعداد الكوكيز
    return new Response(JSON.stringify({ message: 'Logged in successfully', name: user.name, hi: tyu == 1 ? 'Admin' : 'User' }), {
      status: 200,
      headers: {
        'Set-Cookie': `token=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict; Secure;`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Failed to login' }), { status: 500 });
  }
}


