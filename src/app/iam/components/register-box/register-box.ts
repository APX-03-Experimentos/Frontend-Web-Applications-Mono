import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../../shared/services/token.service';
import { LoadingService } from '../../../shared/services/loading.service';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { CaptchaService } from '../../services/captcha.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register-box',
  imports: [
    MatCardContent,
    MatLabel,
    MatFormField,
    MatCard,
    MatInput,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    FormsModule,
    TranslatePipe,
    MatIcon
  ],
  templateUrl: './register-box.html',
  standalone: true,
  styleUrl: './register-box.css'
})
export class RegisterBox implements OnInit, OnDestroy {

  userType: string = "ROLE_STUDENT";
  username: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";

  passwordsMatch = true;
  captchaToken: string = '';
  isCaptchaLoaded: boolean = false;
  private captchaSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private loadingService: LoadingService,
    private router: Router,
    private captchaService: CaptchaService
  ) {}

  async ngOnInit() {
    await this.initializeCaptcha();
  }

  ngOnDestroy() {
    if (this.captchaSubscription) {
      this.captchaSubscription.unsubscribe();
    }
  }

  async initializeCaptcha() {
    try {
      // Obtener la site key del backend
      const config = await this.captchaService.getSiteKey().toPromise();

      // Renderizar el reCAPTCHA
      await this.captchaService.render('recaptcha-container', config!.siteKey);
      this.isCaptchaLoaded = true;

      // Suscribirse a cambios en el token
      this.captchaSubscription = this.captchaService.tokenChange.subscribe(token => {
        this.captchaToken = token;
        console.log('Token captcha actualizado:', token ? '✅ Válido' : '❌ Vacío');
      });

    } catch (error) {
      console.error('Error inicializando reCAPTCHA:', error);
      // En caso de error, permitir registro sin CAPTCHA para desarrollo
      this.isCaptchaLoaded = true;
      this.captchaToken = 'bypass-for-development';
    }
  }

  async SignUp(): Promise<void> {
    console.log('=== INICIANDO REGISTRO ===');
    console.log('Username:', this.username);
    console.log('Captcha Token:', this.captchaToken ? '✅ Presente' : '❌ Faltante');

    // Validar contraseñas
    if (this.password !== this.confirmPassword) {
      this.passwordsMatch = false;
      return;
    }

    // Validar campos requeridos
    if (!this.username || !this.password) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    // Validar reCAPTCHA
    if (!this.captchaToken || this.captchaToken === '') {
      alert('Por favor completa el reCAPTCHA');
      return;
    }

    this.loadingService.startLoadingDialog();

    try {
      // Registrar usuario (el backend manejará la verificación del CAPTCHA)
      this.authService.signup(this.username, this.password, this.userType, this.captchaToken).subscribe({
        next: (account) => {
          console.log('✅ Registro exitoso:', account);

          // Login automático después del registro
          this.authService.login(account.userName, this.password).subscribe({
            next: (result) => {
              this.tokenService.setToken(result.token);
              this.router.navigate(['courses']).then(() => {
                this.loadingService.stopLoadingDialog();
              });
            },
            error: (loginError) => {
              console.error('❌ Error en login automático:', loginError);
              this.loadingService.stopLoadingDialog();
              alert('Registro exitoso, pero error en login automático. Por favor inicia sesión manualmente.');
            }
          });
        },
        error: (err) => {
          console.error('❌ Error en registro:', err);
          this.loadingService.stopLoadingDialog();

          // Mostrar mensaje de error específico
          if (err.error?.message) {
            alert('Error en registro: ' + err.error.message);
          } else {
            alert('Error en registro. Por favor intenta nuevamente.');
          }

          // Resetear CAPTCHA en caso de error
          this.captchaService.reset();
        }
      });

    } catch (error) {
      console.error('❌ Error general:', error);
      this.loadingService.stopLoadingDialog();
      alert('Error inesperado. Por favor intenta nuevamente.');
    }
  }

  // Método para resetear el formulario
  resetForm() {
    this.username = '';
    this.password = '';
    this.confirmPassword = '';
    this.passwordsMatch = true;
    this.captchaService.reset();
  }
}
