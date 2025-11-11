import {Component} from '@angular/core';
import {MatCard, MatCardContent} from '@angular/material/card';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {TokenService} from '../../../shared/services/token.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {MatIcon} from '@angular/material/icon';

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
export class RegisterBox {

  userType: string = "ROLE_STUDENT";
  username: string = "";
  email: string = "";
  password: string = "";
  confirmPassword: string = "";

  passwordsMatch = true;

  constructor(private authService: AuthService, private tokenService: TokenService, private loadingService: LoadingService, private router: Router) {}

  SignUp(): void {
    if (this.password === this.confirmPassword) {
      this.loadingService.startLoadingDialog();
      this.authService.signup(this.username, this.password, this.userType).subscribe({
        next: account => {
          this.authService.login(account.userName, this.password).subscribe({
            next: result => {
              this.tokenService.setToken(result.token);
              this.router.navigate(['courses']).then();
            }
          })
        },
        error: err => {
          console.error("Error en registro:", err);
          this.loadingService.stopLoadingDialog();
        },
        complete: () => {
          this.loadingService.stopLoadingDialog();
        }
      })
    } else {
      this.passwordsMatch = false;
    }
  }

}
