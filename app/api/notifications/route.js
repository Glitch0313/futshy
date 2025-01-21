import prisma from '../../../lib/prisma';
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

    // if (!token) {
    //   return new Response(JSON.stringify({ error: 'Not authenticated' }), {
    //     status: 401,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // إذا لم يكن هناك توكن، جلب جميع الإشعارات
    if (!token) {
      const allNotifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return new Response(JSON.stringify(allNotifications), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // فك تشفير التوكن
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET_KEY);
    } catch (error) {
      console.error('Error decoding token:', error.message);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // جلب الإشعارات بناءً على userId
    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.id },
      orderBy: { createdAt: 'desc' },
    });

    return new Response(JSON.stringify(notifications), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch notifications' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    // قراءة البيانات المرسلة في الطلب
    const body = await req.json();

    // تحقق من الحقول المطلوبة
    if (!body.title || !body.content || !body.userId) {
      return new Response(
        JSON.stringify({ error: 'Title, content, and userId are required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // إنشاء إشعار جديد في قاعدة البيانات
    const newNotification = await prisma.notification.create({
      data: {
        title: body.title,
        content: body.content,
        unread: body.unread || true, // إذا لم يتم تحديد "unread"، سيتم تعيينها إلى true
        userId: body.userId,
        type: body.type || 'default',
      },
    });

    // إعادة الإشعار الذي تم إنشاؤه في الاستجابة
    return new Response(JSON.stringify(newNotification), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to create notification' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function DELETE(req) {
  try {
    // قراءة id من الـ query
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Notification ID is required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // حذف الإشعار من قاعدة البيانات
    await prisma.notification.delete({
      where: { id: parseInt(id) },
    });

    return new Response(JSON.stringify({ message: 'Notification deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting notification:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to delete notification' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, title, content, unread, type } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Notification ID is required.' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: parseInt(id) },
      data: {
        title: title || undefined, // تحديث فقط إذا كانت القيم موجودة
        content: content || undefined,
        unread: unread !== undefined ? unread : undefined,
        type: type || undefined,
      },
    });

    return new Response(JSON.stringify(updatedNotification), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating notification:', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to update notification' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}