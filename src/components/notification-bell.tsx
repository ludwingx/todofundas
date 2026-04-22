'use client'

import { useState, useEffect, useTransition } from 'react'
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { getNotificationsAction, markNotificationReadAction, markAllNotificationsReadAction } from '@/app/actions/notifications'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  title: string
  message: string
  isRead: boolean
  type: string
  createdAt: Date
}

const typeIcon: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-blue-500" />,
  warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
  success: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPending, startTransition] = useTransition()

  const fetchNotifications = () => {
    startTransition(async () => {
      const res = await getNotificationsAction()
      if (res.success && res.notifications) {
        setNotifications(res.notifications as Notification[])
        setUnreadCount(res.unreadCount ?? 0)
      }
    })
  }

  useEffect(() => {
    fetchNotifications()
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkRead = (id: string) => {
    startTransition(async () => {
      await markNotificationReadAction(id)
      fetchNotifications()
    })
  }

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllNotificationsReadAction()
      fetchNotifications()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-2 border-background"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <h4 className="text-sm font-semibold">Notificaciones</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={handleMarkAllRead}
              disabled={isPending}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Leer todas
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No hay notificaciones</p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              className={cn(
                "flex items-start gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0",
                !n.isRead && "bg-primary/5"
              )}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
            >
              <div className="mt-0.5 shrink-0">
                {typeIcon[n.type] || typeIcon.info}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm", !n.isRead && "font-semibold")}>{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
              {!n.isRead && (
                <div className="mt-1 shrink-0">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                </div>
              )}
            </div>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
