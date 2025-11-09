import { Component } from '@angular/core';
import {MatSidenav, MatSidenavContainer, MatSidenavContent} from '@angular/material/sidenav';
import {NgOptimizedImage, Location} from '@angular/common';
import {MatToolbar} from '@angular/material/toolbar';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TokenService} from '../../../shared/services/token.service';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {LoadingService} from '../../../shared/services/loading.service';
import {NotificationsBellComponent} from '../../../notifications/components/notification-bell/notification-bell';

@Component({
  selector: 'app-navigator',
  imports: [
    MatSidenavContainer,
    MatSidenav,
    NgOptimizedImage,
    MatSidenavContent,
    MatToolbar,
    MatIcon,
    MatIconButton,
    RouterOutlet,
    MatButton,
    RouterLink,
    NotificationsBellComponent
  ],
  templateUrl: './navigator.html',
  standalone: true,
  styleUrl: './navigator.css'
})
export class Navigator {
  constructor(private tokenService: TokenService,
              private router: Router,
              private loadingService: LoadingService,
              private location: Location) {}

  IsUserLoggedIn(): boolean
  {
    return this.tokenService.isLoggedIn;
  }

  LogOut() {
    this.loadingService.startLoadingDialog();
    this.tokenService.resetToken();
    this.router.navigate(['auth']).then(r => {this.loadingService.stopLoadingDialog()});
  }

  GoBack(): void{
    this.location.back()
  }
}
