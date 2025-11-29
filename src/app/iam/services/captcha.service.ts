import { Injectable, EventEmitter } from '@angular/core';
import { BaseService } from '../../shared/services/base.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpBackend } from '@angular/common/http';

const captchaResourceEndpoint = environment.captchaEndpointPath;

@Injectable({
  providedIn: 'root'
})
export class CaptchaService extends BaseService<any> {
  private loadingPromise?: Promise<void>;
  private widgetId?: number;
  private token: string = '';
  public tokenChange = new EventEmitter<string>();
  private noInterceptorHttp: HttpClient;
  private isScriptLoaded = false;
  private siteKey?: string;

  constructor(private httpBackend: HttpBackend) {
    super();
    this.noInterceptorHttp = new HttpClient(this.httpBackend);
  }

  getSiteKey(): Observable<{ siteKey: string }> {
    const url = `${this.serverBaseUrl}${captchaResourceEndpoint}/config`;
    return this.noInterceptorHttp.get<{ siteKey: string }>(url).pipe(
      catchError(() => {
        return throwError(() => new Error('No se pudo obtener la configuración del CAPTCHA'));
      })
    );
  }

  loadScriptV2(): Promise<void> {
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise((resolve, reject) => {
      if (this.isScriptLoaded && (window as any).grecaptcha) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="google.com/recaptcha/api"]');
      if (existingScript) {
        this.waitForGrecaptcha(resolve, reject);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isScriptLoaded = true;
        this.waitForGrecaptcha(resolve, reject);
      };

      script.onerror = () => {
        reject(new Error('No se pudo cargar el script de reCAPTCHA'));
      };

      document.head.appendChild(script);
    });

    return this.loadingPromise;
  }

  private waitForGrecaptcha(resolve: () => void, reject: (err: any) => void): void {
    let attempts = 0;
    const maxAttempts = 50;
    const interval = setInterval(() => {
      attempts++;
      const grecaptcha = (window as any).grecaptcha;

      if (grecaptcha && grecaptcha.render) {
        clearInterval(interval);
        resolve();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        reject(new Error('grecaptcha no disponible después de cargar script'));
      }
    }, 100);
  }

  async render(containerId: string, siteKey: string): Promise<number> {
    try {
      await this.loadScriptV2();
      this.siteKey = siteKey;
      return await this.renderCaptcha(containerId, siteKey);
    } catch (error) {
      throw error;
    }
  }

  private renderCaptcha(containerId: string, siteKey: string): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      const grecaptcha = (window as any).grecaptcha;

      if (!grecaptcha?.render) {
        reject(new Error('grecaptcha no disponible después de la carga'));
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) {
        reject(new Error(`Contenedor de reCAPTCHA no encontrado: ${containerId}`));
        return;
      }

      container.innerHTML = '';

      if (this.widgetId !== undefined) {
        try {
          grecaptcha.reset(this.widgetId!);
        } catch (e) {
        }
      }

      try {
        this.widgetId = grecaptcha.render(container, {
          sitekey: siteKey,
          theme: 'light',
          callback: (token: string) => {
            this.token = token;
            this.tokenChange.emit(token);
          },
          'expired-callback': () => {
            this.token = '';
            this.tokenChange.emit('');
          },
          'error-callback': () => {
            this.token = '';
            this.tokenChange.emit('');
          }
        });

        resolve(this.widgetId!);
      } catch (error) {
        reject(error);
      }
    });
  }

  reset(): void {
    const grecaptcha = (window as any).grecaptcha;
    if (this.widgetId !== undefined && grecaptcha?.reset) {
      try {
        grecaptcha.reset(this.widgetId!);
        this.token = '';
        this.tokenChange.emit('');
      } catch (error) {
      }
    }
  }

  async reload(): Promise<void> {
    this.loadingPromise = undefined;
    this.token = '';
    this.tokenChange.emit('');

    const container = document.getElementById('recaptcha-container');
    if (container) {
      container.innerHTML = '';
    }

    if (this.siteKey) {
      try {
        await this.render('recaptcha-container', this.siteKey);
      } catch (error) {
      }
    }
  }
}
