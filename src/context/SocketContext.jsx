import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';
import { requestNotificationPermission, onForegroundMessage } from '../config/firebase';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

// High-fidelity web audio chime fallback
const playWebAudioChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, ctx.currentTime + 0.1); // B5
    gain2.gain.setValueAtTime(0.35, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.7);
  } catch (e) {
    // Audio unsupported or blocked
  }
};

// Play audio notification using /notification.mp3 with synth fallback
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/notification.mp3');
    audio.volume = 1.0;
    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Fallback to web audio synthesizer if browser blocked audio file
        playWebAudioChime();
      });
    }
  } catch (e) {
    playWebAudioChime();
  }
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Pre-unlock audio on user interaction to satisfy browser autoplay policies
    let unlocked = false;
    const unlockAudio = () => {
      if (unlocked) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') ctx.resume();
        }
        const dummy = new Audio('/notification.mp3');
        dummy.volume = 0.001;
        dummy.play().then(() => {
          dummy.pause();
          dummy.currentTime = 0;
          unlocked = true;
        }).catch(() => {});
      } catch (e) {}
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('pointerdown', unlockAudio);

    // Check for admin_token first, then fallback to token
    const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
    const adminInfo = JSON.parse(localStorage.getItem('admin_info') || '{}');

    // Helper to decode JWT
    const parseJwt = (tokenStr) => {
      try {
        return JSON.parse(atob(tokenStr.split('.')[1]));
      } catch (e) {
        return null;
      }
    };

    // 1. Initialize Firebase FCM Web Push and register device token with backend
    const setupFCM = async () => {
      if (!token) return;
      try {
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          console.log('Sending FCM device token to backend...');
          await axiosInstance.post('/notifications/fcm-token', { token: fcmToken });
          console.log('✅ FCM token registered on backend server.');
        }
      } catch (fcmErr) {
        console.warn('FCM registration skipped or failed:', fcmErr.message);
      }
    };

    setupFCM();

    // Deduplication tracker so an alert is NEVER displayed more than once
    const seenAlertKeys = new Set();
    const shouldDisplayAlert = (key) => {
      if (!key) return true;
      if (seenAlertKeys.has(key)) return false;
      seenAlertKeys.add(key);
      setTimeout(() => seenAlertKeys.delete(key), 12000);
      return true;
    };

    // 2. Setup Firebase Foreground Push Listener (Fallback if socket is disconnected)
    let unsubscribeFCM = null;
    onForegroundMessage((payload) => {
      const alertKey = payload.data?.appNo || payload.notification?.title;
      
      // If already shown by Socket.io, do not show duplicate toast!
      if (!shouldDisplayAlert(alertKey)) {
        // Still update the badge and history silently
        window.dispatchEvent(new CustomEvent('admissions_updated'));
        window.dispatchEvent(new CustomEvent('live-notification', { detail: payload }));
        return;
      }

      playNotificationSound();
      const notifType = payload.data?.type || 'General';
      const isAssignment = notifType === 'Assignment';
      const isMaterial = notifType === 'StudyMaterial';
      const isNotice = notifType === 'Notice';

      const title = payload.notification?.title || payload.data?.title || (isAssignment ? '📝 New Assignment' : isMaterial ? '📚 New Study Material' : isNotice ? '📢 College Notice' : 'New Notification');
      const body = payload.notification?.body || payload.data?.body || payload.data?.message || '';
      const link = payload.data?.link || (isAssignment ? '/student/assignments' : isMaterial ? '/student/materials' : isNotice ? '/student/notices' : '/admissions/applications');
      const badgeBg = isAssignment ? 'bg-amber-500' : isMaterial ? 'bg-blue-600' : isNotice ? 'bg-rose-500' : 'bg-primary';
      const btnBg = isAssignment ? 'bg-amber-600 hover:bg-amber-700' : isMaterial ? 'bg-blue-600 hover:bg-blue-700' : isNotice ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary-hover';
      const btnText = isAssignment ? 'View Task' : isMaterial ? 'Open Notes' : isNotice ? 'View Notice' : 'View';
      const iconEmoji = isAssignment ? '📝' : isMaterial ? '📚' : isNotice ? '📢' : '🎓';
      const borderColor = isAssignment ? 'border-amber-400' : isMaterial ? 'border-blue-400' : isNotice ? 'border-rose-400' : 'border-primary/20';

      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 ${borderColor} p-4`}>
          <div className="flex-1 w-0">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`w-10 h-10 rounded-xl ${badgeBg} text-white flex items-center justify-center text-xl shadow-sm`}>
                  {iconEmoji}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-gray-900">{title}</p>
                <p className="mt-1 text-xs text-gray-600 leading-relaxed">{body}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center ml-4 pl-4 border-l border-gray-100 gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = link;
              }}
              className={`px-3 py-1.5 ${btnBg} text-white text-xs font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap`}
            >
              {btnText}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs font-medium"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 8000, position: 'top-right' });

      window.dispatchEvent(new CustomEvent('admissions_updated'));
      window.dispatchEvent(new CustomEvent('assignments_updated'));
      window.dispatchEvent(new CustomEvent('materials_updated'));
      window.dispatchEvent(new CustomEvent('notices_updated'));
      window.dispatchEvent(new CustomEvent('student_content_updated'));
      window.dispatchEvent(new CustomEvent('live-notification', { detail: payload }));
    }).then((unsub) => {
      unsubscribeFCM = unsub;
    });

    // 3. Connect Socket.IO for instant live events
    if (token) {
      const decoded = parseJwt(token);
      const userId = decoded?.id || adminInfo._id;
      let collegeId = adminInfo.collegeId || decoded?.collegeId;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';
      const socketUrl = apiUrl.endsWith('/api') ? apiUrl.replace('/api', '') : apiUrl;
      
      const newSocket = io(socketUrl, {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server:', newSocket.id);
        if (userId) newSocket.emit('register', userId);
        if (collegeId) {
          newSocket.emit('join_college', collegeId);
        } else {
          // Fallback fetch to resolve collegeId if missing
          axiosInstance.get('/college-admin/me').then(res => {
            const cId = res.data?.collegeId || res.data?._id;
            if (cId) {
              adminInfo.collegeId = cId;
              try { localStorage.setItem('admin_info', JSON.stringify(adminInfo)); } catch (e) {}
              newSocket.emit('join_college', cId);
            }
          }).catch(() => {
            axiosInstance.get('/student-portal/profile').then(res => {
              const cId = res.data?.collegeId || res.data?.college?._id;
              if (cId) {
                adminInfo.collegeId = cId;
                try { localStorage.setItem('admin_info', JSON.stringify(adminInfo)); } catch (e) {}
                newSocket.emit('join_college', cId);
              }
            }).catch(() => {});
          });
        }
      });

      // Handle real-time admission alert
      const handleAdmissionAlert = (data) => {
        // Filter by college if collegeId is present
        if (collegeId && data.collegeId && String(data.collegeId) !== String(collegeId)) {
          return;
        }

        const alertKey = data.appNo || data.title;
        // Check deduplication
        if (!shouldDisplayAlert(alertKey)) {
          return;
        }

        playNotificationSound();

        // Show Single Rich Interactive Toast
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 border-primary p-4`}>
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-xl shadow-md">
                    🎓
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900">{data.title || 'New Admission Application!'}</p>
                  <p className="mt-1 text-xs text-gray-700 leading-relaxed font-medium">
                    <span className="font-semibold text-primary">{data.name}</span> applied for <span className="font-semibold text-gray-900">{data.course}</span> {data.branch ? `(${data.branch})` : ''}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-400 font-mono">App No: {data.appNo}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center ml-3 pl-3 border-l border-gray-100 gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = data.link || '/admissions/applications';
                }}
                className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-sm whitespace-nowrap"
              >
                View App
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        ), { duration: 10000, position: 'top-right' });

        // Dispatch instant events so sidebar badge updates immediately!
        window.dispatchEvent(new CustomEvent('admissions_updated'));
        window.dispatchEvent(new CustomEvent('live-notification', { detail: data }));
      };

      // Handle real-time notifications (Assignments, Study Materials, Notices, etc.)
      const handleStudentNotification = (data) => {
        const alertKey = (data.noticeId || data.extraData?.assignmentId || data.extraData?.materialId || data.message || data.title) + '_' + (data.studentId || data.recipientId || '');
        if (!shouldDisplayAlert(alertKey)) return;

        playNotificationSound();

        const isAssignment = data.type === 'Assignment';
        const isMaterial = data.type === 'StudyMaterial';
        const isNotice = data.type === 'Notice';

        const title = data.title || (isAssignment ? '📝 New Assignment' : (isMaterial ? '📚 New Study Material' : (isNotice ? '📢 College Notice' : '🔔 New Notification')));
        const body = data.message || '';
        const roleLower = (adminInfo.role || '').toLowerCase();
        const isStudentUser = roleLower === 'student';
        const isTeacherUser = roleLower.includes('teacher');
        let link = data.link;
        if (isNotice) {
          if (isStudentUser) link = '/student/notices';
          else if (isTeacherUser) link = '/teacher-portal/notices';
          else if (roleLower.includes('warden')) link = '/hostel-warden/notices';
          else link = '/notice';
        } else if (isAssignment) {
          if (isStudentUser) link = '/student/assignments';
          else if (isTeacherUser) link = '/teacher-portal/assignments';
          else link = '/assignments';
        } else if (isMaterial) {
          if (isStudentUser) link = '/student/materials';
          else if (isTeacherUser) link = '/teacher-portal/study-materials';
          else link = '/study-materials';
        }

        const badgeBg = isAssignment ? 'bg-amber-500' : (isMaterial ? 'bg-blue-600' : (isNotice ? 'bg-rose-500' : 'bg-primary'));
        const btnBg = isAssignment ? 'bg-amber-600 hover:bg-amber-700' : (isMaterial ? 'bg-blue-600 hover:bg-blue-700' : (isNotice ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary hover:bg-primary-hover'));
        const btnText = isAssignment ? 'View Task' : (isMaterial ? 'Open Notes' : (isNotice ? 'View Notice' : 'View'));
        const iconEmoji = isAssignment ? '📝' : (isMaterial ? '📚' : (isNotice ? '📢' : '🔔'));
        const borderColor = isAssignment ? 'border-amber-400' : (isMaterial ? 'border-blue-400' : (isNotice ? 'border-rose-400' : 'border-primary'));

        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-2 ${borderColor} p-4 transition-all`}>
            <div className="flex-1 w-0">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className={`w-10 h-10 rounded-xl ${badgeBg} text-white flex items-center justify-center text-xl shadow-md`}>
                    {iconEmoji}
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  <p className="mt-1 text-xs text-gray-700 leading-relaxed font-medium">{body}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center ml-3 pl-3 border-l border-gray-100 gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = link || '/student/notices';
                }}
                className={`px-3 py-1.5 ${btnBg} text-white text-xs font-semibold rounded-lg transition-colors shadow-sm whitespace-nowrap`}
              >
                {btnText}
              </button>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="px-2 py-1 text-gray-400 hover:text-gray-600 text-xs font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        ), { duration: 10000, position: 'top-right' });

        // Dispatch instant window events
        window.dispatchEvent(new CustomEvent('live-notification', { detail: data }));
        window.dispatchEvent(new CustomEvent('assignments_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('materials_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('notices_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('student_content_updated', { detail: data }));
      };

      newSocket.on('new_student_notification', handleStudentNotification);

      // Listen for dual-channel targeted broadcast from college room
      newSocket.on('new_student_notification_broadcast', (data) => {
        const myId = String(userId || '');
        const role = (adminInfo.role || '').toLowerCase();
        const isAdmin = role === 'college_admin' || !role;
        const isTargeted = !data.recipientIds || 
          (Array.isArray(data.recipientIds) && (
            data.recipientIds.includes(myId) || 
            (isAdmin && data.recipientIds.includes('admin'))
          ));
        if (isTargeted) {
          handleStudentNotification(data);
        }
      });

      // Content update listeners for real-time live page refreshes
      newSocket.on('materials_updated', (data) => {
        window.dispatchEvent(new CustomEvent('materials_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('student_content_updated', { detail: data }));
      });
      newSocket.on('assignments_updated', (data) => {
        window.dispatchEvent(new CustomEvent('assignments_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('student_content_updated', { detail: data }));
      });
      newSocket.on('notices_updated', (data) => {
        window.dispatchEvent(new CustomEvent('notices_updated', { detail: data }));
        window.dispatchEvent(new CustomEvent('student_content_updated', { detail: data }));
      });
      newSocket.on('student_content_updated', (data) => {
        window.dispatchEvent(new CustomEvent('student_content_updated', { detail: data }));
        if (data?.type === 'StudyMaterial') {
          window.dispatchEvent(new CustomEvent('materials_updated', { detail: data }));
        } else if (data?.type === 'Assignment') {
          window.dispatchEvent(new CustomEvent('assignments_updated', { detail: data }));
        } else if (data?.type === 'Notice') {
          window.dispatchEvent(new CustomEvent('notices_updated', { detail: data }));
        }
      });

      newSocket.on('new_notification', (data) => {
        if (data.type === 'Assignment' || data.type === 'StudyMaterial' || data.type === 'Notice') {
          handleStudentNotification(data);
          return;
        }
        playNotificationSound();
        toast(data.message, {
          icon: '🔔',
          duration: 6000,
          style: {
            borderRadius: '12px',
            background: '#1e293b',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '500'
          },
        });
        window.dispatchEvent(new CustomEvent('live-notification', { detail: data }));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
        if (typeof unsubscribeFCM === 'function') unsubscribeFCM();
      };
    }
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
