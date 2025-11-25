'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const { address, isConnected } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected && address) {
      fetchNotifications();
    }
  }, [mounted, isConnected, address]);

  const fetchNotifications = async () => {
    if (!address) return;

    try {
      const response = await fetch(`/api/notifications?walletAddress=${address}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationIds?: string[]) => {
    if (!address) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          notificationIds,
        }),
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_TRADE':
        return '📈';
      case 'SUBSCRIPTION_STARTED':
        return '✅';
      case 'SUBSCRIPTION_ENDED':
        return '⏹️';
      case 'TRADE_COPIED':
        return '📋';
      case 'RISK_ALERT':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted || !isConnected) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setShowDialog(true)}
      >
        🔔
        {unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
            <DialogDescription>
              {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'You\'re all caught up!'}
            </DialogDescription>
          </DialogHeader>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No notifications yet
            </div>
          ) : (
            <div className="space-y-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => markAsRead()}
                  disabled={isLoading}
                >
                  Mark all as read
                </Button>
              )}

              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${
                    notification.read
                      ? 'bg-gray-800 border-gray-700 opacity-60'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead([notification.id])}
                        disabled={isLoading}
                      >
                        ✓
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

