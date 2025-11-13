import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { StompWebSocketService } from '../../../shared/services/websocket.service';
import { AuthService } from '../../../iam/services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { Notification } from '../../model/notification.entity';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {DatePipe, SlicePipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-notifications-bell',
  templateUrl: 'notification-bell.html',
  styleUrl: 'notification-bell.css',
  standalone: true,
  imports: [
    MatMenuTrigger,
    MatIconButton,
    MatIcon,
    SlicePipe,
    DatePipe,
    MatMenu,
    MatMenuItem,
    TranslatePipe,
    MatTooltip
  ]
})
export class NotificationsBellComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  private subscription?: Subscription;

  constructor(
    private wsService: StompWebSocketService,
    private authService: AuthService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    this.authService.fetchLoggedUser().subscribe({
      next: (user) => {
        this.notificationsService.getByUserId(user.id).subscribe({
          next: (oldNotifications: Notification[]) => {
            this.notifications = oldNotifications.sort(
              (a, b) => new Date(b.ocurredAt).getTime() - new Date(a.ocurredAt).getTime()
            );
            this.updateUnreadCount();
          }
        });

        this.wsService.connect(user.id);
        this.subscription = this.wsService.getNotifications().subscribe((notify: Notification) => {
          this.notifications.unshift(notify);
          this.updateUnreadCount();
          console.log('🔔 Nueva notificación:', notify);
        });
      },
      error: (err) => {
        console.error('Error fetching logged user:', err);
      }
    });
  }

  markAsRead(notification: Notification) {
    if (notification.read) return; // already read
    this.notificationsService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.read = true;
        this.updateUnreadCount();
      },
      error: (err) => console.error('Error marking as read', err)
    });
  }

  markAllAsRead() {
    this.notifications.forEach((n) => {
      if (!n.read) {
        this.notificationsService.markAsRead(n.id).subscribe({
          next: () => {
            n.read = true;
            this.updateUnreadCount();
          },
          error: (err) => console.error('Error marking notification as read', err)
        });
      }
    });
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter((n) => !n.read).length;
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
    this.wsService.disconnect();
  }
}
