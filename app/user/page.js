'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';

export default function UserDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const router = useRouter();
  const [authy, setAuthy] = useState(false)

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
          buttons: 'OK',
        }).then((willDelete) => {
          if (willDelete) {
            router.push('/login');
          }
        });
        return false;
      }
    };
  
    // استدعاء API لجلب الإشعارات
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications', {
          withCredentials: true, // السماح بإرسال الكوكيز مع الطلب
        });
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        alert('Failed to fetch notifications');
      }
    };
  
    // التأكد من المصادقة ثم جلب الإشعارات
    checkAuthentication().then((isAuthenticated) => {
      if (isAuthenticated) {
        setAuthy(true);
        fetchNotifications();
      }
    });
  }, [authy]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const deleteNotification = async (id) => {
    try {
      const response = await axios.delete(`/api/notifications?id=${id}`);
      console.log(response.data.message);
      alert('Notification deleted successfully.');
      router.push('/dashboard'); // إعادة تحميل الصفحة لتحديث الإشعارات
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification.');
    }
  };

  const handleLogout = async () => {
    try {
      // استدعاء API لتسجيل الخروج
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
  
      alert('You have been logged out.');
  
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      router.push('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Failed to log out.');
    }
  };  

  return (
    authy ? (
      <div className="container mt-5">
        <h1>User Dashboard</h1>
        <div className="row">
          <div className="col-md-6">
            <h3>Notifications</h3>
            <button className="btn btn-danger mb-3" onClick={handleLogout}>
              Logout
          </button>
            {notifications.length === 0 ? (
              <p>No notifications available.</p>
            ) : (
              <ul className="list-group">
                {notifications.map((notification) => (
      
                  <li
                    key={notification.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                    onClick={() => handleNotificationClick(notification)}
                    style={{ cursor: 'pointer' }}
                  >
                    {notification.title} - {notification.content}
                    <>
                      <span className="badge bg-primary rounded-pill">
                        {notification.unread ? 'New' : ''}
                      </span>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >DEL</button>
                    </>
                  </li>
        
                ))}
              </ul>
            )}
          </div>
          <div className="col-md-6">
            <h3>Notification Details</h3>
            {selectedNotification ? (
              <div className='card p-3'>
                <div className='card-header d-flex justify-content-between'>
                  <h5>{selectedNotification.title}</h5>
                </div>

                <div className='card-body'>
                  <p>{selectedNotification.content}</p>
                </div>
              </div>
            ) : (
              <p>Select a notification to view details.</p>
            )}
          </div>
        </div>
      </div>
    ) : 
    (
      <div className="container mt-5">
        <h1>Profile Page</h1>
        <p>Loading...</p>
      </div>
    )
    
  );
}
