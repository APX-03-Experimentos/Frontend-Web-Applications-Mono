import {Component, OnInit} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {FormsModule} from '@angular/forms';
import {LoginBox} from '../../components/login-box/login-box';
import {RegisterBox} from '../../components/register-box/register-box';
import {AuthService} from '../../services/auth.service';

import {TokenService} from '../../../shared/services/token.service';
import {Router, RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-auth-page',
  imports: [
    NgOptimizedImage,
    MatButtonToggleGroup,
    MatButtonToggle,
    FormsModule,
    LoginBox,
    RegisterBox,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './auth-page.html',
  standalone: true,
  styleUrl: './auth-page.css'
})
export class AuthPage implements OnInit {

  constructor(private tokenService: TokenService, private router: Router,
              private authService: AuthService ) {}

  ngOnInit() {
    if (this.tokenService.isLoggedIn) {
      this.authService.fetchLoggedUser().subscribe({
        next: (user: any) => { // Tipado explícito
          if (user.roles && user.roles.includes('ROLE_ADMIN')) {
            this.router.navigate(['/admin/users']);
          } else {
            this.router.navigate(['/courses']);
          }
        },
        error: () => {
          this.router.navigate(['/courses']);
        }
      });
    }
  }

  authType: string = "login";
}
