import {Component, OnInit} from '@angular/core';
import {CreateCourseBox} from '../../components/create-course-box/create-course-box';
import {CourseList} from '../../components/course-list/course-list';
import {AuthService} from '../../../iam/services/auth.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {JoinCourseBox} from '../../components/join-course-box/join-course-box';
import {TokenService} from '../../../shared/services/token.service';
import {Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-courses-page',
  imports: [
    CreateCourseBox,
    CourseList,
    JoinCourseBox,
    TranslatePipe
  ],
  templateUrl: './courses-page.html',
  standalone: true,
  styleUrl: './courses-page.css'
})
export class CoursesPage implements OnInit {

  userRole: string = "";

  constructor(private authService: AuthService,
              private tokenService: TokenService,
              private loadingService:LoadingService,
              private router: Router) {}

  ngOnInit() {
    if (!this.tokenService.isLoggedIn)
    {
      this.router.navigate(["/no-access"])
    }
    this.fetchLoggedUserRole();
  }

  fetchLoggedUserRole(): void {
    this.authService.fetchLoggedUser().subscribe({
      next: result => {
        this.userRole = result.roles[0];
      },
      error: err => {
        console.log(err);
      }
    })
  }
}
