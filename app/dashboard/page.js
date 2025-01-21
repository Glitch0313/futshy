'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [userId, setUserId] = useState('');
  const [isUpd, setIsUpd] = useState(false); // حالة التحديث
  const [editId, setEditId] = useState(null); // ID الإشعار الذي يتم تحديثه
  const [authy, setAuthy] = useState(false);
  const router = useRouter();

  // تحميل المستخدمين والإشعارات عند التحميل الأول
  useEffect(() => {
    // التحقق من وجود التوكن
    const checkAuthentication = async () => {
      try {
        const response = await axios.get('/api/auth/validate', {
          withCredentials: true, // إرسال الكوكيز مع الطلب
        });
  
        if (!response.data.isAuthenticated) {
          throw new Error('Not authenticated');
        }
        
        // إذا تم التحقق من المصادقة، إرجاع true
        return true;
      } catch (error) {
        // console.error('Authentication error:', error);
        swal({
          title: "Authentication Error",
          text: "You need to be authenticated to access this page.",
          icon: "success",
          buttons: true,
        }).then((willDelete) => {
          if (willDelete) {
            router.push('/login');
          }else{
            router.push('/dashboard');
          }
        });
        return false;
      }
    };

    // التأكد من المصادقة ثم جلب الإشعارات
    checkAuthentication().then((isAuthenticated) => {
      if (isAuthenticated) {
        setAuthy(true);
        axios.get('/api/users').then((res) => setUsers(res.data));
        axios.get('/api/notifications').then((res) => setNotifications(res.data));

      }else{
        axios.get('/api/notifications').then((res) => setNotifications(res.data));
      }
    });
    
  }, []);

  // دالة لإرسال الرسالة أو تحديثها
  const handleSave = async () => {
    if (!content || !userId || !title) {
      alert('Title, content, and userId are required!');
      return;
    }

    try {
      if (isUpd) {
        // تحديث الإشعار
        const response = await axios.put('/api/notifications', {
          id: editId,
          title,
          content,
          userId: parseInt(userId),
        });

        // تحديث الحالة لعرض التعديلات
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === editId ? { ...notif, title, content, userId: parseInt(userId) } : notif
          )
        );

        alert('Notification updated successfully!');
      } else {
        // إنشاء إشعار جديد
        const response = await axios.post('/api/notifications', {
          title,
          content,
          userId: parseInt(userId),
        });

        // تحديث الحالة لإضافة الإشعار الجديد
        setNotifications((prev) => [...prev, response.data]);
        alert('Notification created successfully!');
      }

      // إعادة تعيين الحقول
      setContent('');
      setTitle('');
      setUserId('');
      setIsUpd(false);
      setEditId(null);
    } catch (error) {
      console.error('Error saving notification:', error.response?.data || error.message);
      alert('Failed to save notification.');
    }
  };

  // إعداد الحقول للتحديث
  const handleEdit = (notif) => {
    setTitle(notif.title);
    setContent(notif.content);
    setUserId(notif.userId.toString());
    setEditId(notif.id);
    setIsUpd(true);
  };

  return (
 
    authy ? 
    (
      <div className="container mt-5">
        <h1>Admin Dashboard</h1>
        <div className="row">
          <div className="col-md-6">
            <h3>Users</h3>
            <ul className="list-group">
              {users.map((user) => (
                <li className="list-group-item" key={user.id}>
                  {user.name} ({user.email})
                </li>
              ))}
            </ul>
          </div>
          <div className="col-md-6">
            <h3>{isUpd ? 'Update Notification' : 'Send Notification'}</h3>
            <div className="mb-3">
              <label htmlFor="user" className="form-label">User</label>
              <select
                id="user"
                className="form-select"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                id="title"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label htmlFor="content" className="form-label">Message</label>
              <textarea
                id="content"
                className="form-control"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button className="btn btn-primary" onClick={handleSave}>
              {isUpd ? 'Update' : 'Send'}
            </button>
          </div>
        </div>

        {/* عرض الإشعارات */}
        <div className="mt-5">
          <h3>Notifications</h3>
          <ul className="list-group">
            {notifications.map((notif) => (
              <li className="list-group-item d-flex justify-content-between align-items-center" key={notif.id}>
                <div>
                  <strong>{notif.title}:</strong> {notif.content}
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(notif)}>
                  Edit
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
    : 
    (
      <div className="container mt-5">
        <h3>Notifications</h3>
        <ul className="list-group mb-3">
          {notifications.map((notif) => (
            <li className="list-group-item d-flex justify-content-between align-items-center" key={notif.id}>
              <div>
                <strong>{notif.title}:</strong> {notif.content}
              </div>
            </li>
          ))}
        </ul>
        <a href="/login" className='btn btn-info'>Login</a>
      </div>
    )
    
  );
}
