import {Injectable} from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {environment} from '../../../environments/environment';
import {Notification} from '../model/notification.entity';

const notificationsResourceEndpoint = environment.notificationsEndpointPath;
@Injectable({
  providedIn: 'root'
})
export class NotificationsService extends BaseService<Notification> {

  constructor() {
    super();
    this.resourceEndpoint = notificationsResourceEndpoint;
  }

  getByUserId(userId: number) {
    return this.http.get<Notification[]>(`${this.resourcePath()}/user/${userId}`, this.httpOptions);
  }

  markAsRead(notificationId: number) {
    return this.http.put(`${this.resourcePath()}/${notificationId}/read`, {}, this.httpOptions);
  }
}
