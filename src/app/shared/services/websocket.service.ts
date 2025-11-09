import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class StompWebSocketService implements OnDestroy {
  private client: Client;
  private notifications$ = new Subject<any>();
  private connected = false;

  constructor(private tokenService: TokenService) {
    this.client = new Client({
      brokerURL: environment.websocketBaseUrl,
      reconnectDelay: 5000,
      debug: (msg) => console.log('[STOMP]', msg),
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectionTimeout: 5000,
    });
  }

  connect(userId: number): void {
    if (this.connected) {
      console.log('⚠️ WebSocket ya está conectado');
      return;
    }

    const token = this.tokenService.getToken();
    if (!token) {
      console.error('❌ No hay token disponible');
      return;
    }

    this.client.connectHeaders = {
      Authorization: `Bearer ${token}`
    };

    this.client.onConnect = (frame) => {
      console.log('✅ WebSocket conectado exitosamente', frame);
      this.connected = true;

      // Suscripción a notificaciones personales
      this.client.subscribe(`/topic/user/${userId}/notifications`, (message: IMessage) => {
        console.log('📨 Notificación personal recibida:', message.body);
        const body = JSON.parse(message.body);
        this.notifications$.next(body);
      });

      // Suscripción a notificaciones globales
      this.client.subscribe(`/topic/global/notifications`, (message: IMessage) => {
        console.log('📨 Notificación global recibida:', message.body);
        const body = JSON.parse(message.body);
        this.notifications$.next(body);
      });
    };

    this.client.onStompError = (frame) => {
      console.error('❌ STOMP error:', frame.headers['message']);
      console.error('Detalles:', frame.body);
      this.connected = false;
    };

    this.client.onWebSocketError = (event) => {
      console.error('❌ WebSocket error:', event);
      this.connected = false;
    };

    this.client.onDisconnect = () => {
      console.warn('🔌 WebSocket desconectado');
      this.connected = false;
    };

    console.log('🔌 Intentando conectar WebSocket...');
    this.client.activate();
  }

  getNotifications() {
    return this.notifications$.asObservable();
  }

  disconnect(): void {
    if (this.connected) {
      this.client.deactivate();
      this.connected = false;
      console.log('🧹 WebSocket desconectado');
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
