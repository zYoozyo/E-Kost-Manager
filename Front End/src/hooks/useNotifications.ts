import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment_due' | 'payment_overdue' | 'complaint_response' | 'general';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  action?: () => void;
  read: boolean;
  createdAt: Date;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window) {
      Notification.requestPermission().then(setPermission);
    }

    // Check for payment due notifications
    const checkPaymentNotifications = () => {
      const storedPayments = localStorage.getItem('tenant_payments');
      if (storedPayments) {
        const payments = JSON.parse(storedPayments);
        const today = new Date();
        
        payments.forEach((payment: any) => {
          if (payment.status === 'pending') {
            const dueDate = new Date(payment.due_date);
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysUntil <= 3 && daysUntil > 0) {
              addNotification({
                id: `payment_due_${payment.id}`,
                title: 'Pembayaran Akan Jatuh Tempo',
                message: `Tagihan ${payment.periode} akan jatuh tempo dalam ${daysUntil} hari`,
                type: 'payment_due',
                urgency: daysUntil <= 1 ? 'urgent' : 'high',
                action: () => window.location.href = '/tenant/payments'
              });
            } else if (daysUntil < 0) {
              addNotification({
                id: `payment_overdue_${payment.id}`,
                title: 'Pembayaran Terlambat!',
                message: `Tagihan ${payment.periode} terlambat ${Math.abs(daysUntil)} hari`,
                type: 'payment_overdue',
                urgency: 'urgent',
                action: () => window.location.href = '/tenant/payments'
              });
            }
          }
        });
      }
    };

    checkPaymentNotifications();
    const interval = setInterval(checkPaymentNotifications, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<Notification, 'read' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      read: false,
      createdAt: new Date()
    };

    setNotifications(prev => {
      // Avoid duplicates
      if (prev.some(n => n.id === newNotification.id)) {
        return prev;
      }
      return [...prev, newNotification];
    });

    // Show toast notification
    const toastConfig = {
      duration: notification.urgency === 'urgent' ? 10000 : 5000,
      icon: notification.urgency === 'urgent' ? '🚨' : '📢',
    };

    const toastId = toast(notification.message, toastConfig);
    
    // Handle click action separately
    if (notification.action) {
      // Store the action for click handling
      const handleClick = () => {
        notification.action?.();
        toast.dismiss(toastId);
      };
      
      // Add click listener to toast element
      setTimeout(() => {
        const toastElement = document.querySelector(`[data-toast-id="${toastId}"]`) as HTMLElement;
        if (toastElement) {
          toastElement.addEventListener('click', handleClick);
          toastElement.style.cursor = 'pointer';
        }
      }, 100);
    }

    // Browser notification if permitted
    if (permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
    unreadCount,
    permission
  };
};
