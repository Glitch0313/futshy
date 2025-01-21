import prisma from '../../../lib/prisma';

export async function GET(req) {
  try {
    // جلب جميع الرسائل من قاعدة البيانات مع تفاصيل المستخدم المرتبطة بها
    const messages = await prisma.message.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return new Response(JSON.stringify(messages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch messages' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || !body.content || !body.userId) {
      return new Response(
        JSON.stringify({ error: 'Content and userId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { content, userId } = body;

    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(userId, 10) },
    });

    if (!userExists) {
      return new Response(
        JSON.stringify({ error: 'User does not exist' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const message = await prisma.message.create({
      data: { content, userId: parseInt(userId, 10) },
    });

    return new Response(JSON.stringify(message), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating message:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to create message' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
