import {Component, EventEmitter, OnInit} from '@angular/core';
import {CoursesService} from '../../services/courses.service';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {TokenService} from '../../../shared/services/token.service';
import {Course} from '../../model/course.entity';
import {LoadingService} from '../../../shared/services/loading.service';
import {AssignmentList} from '../../../assignments/components/assignment-list/assignment-list';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {
  CreateAssignmentDialog
} from '../../../assignments/components/create-assignment-dialog/create-assignment-dialog';
import {AuthService} from '../../../iam/services/auth.service';
import {User} from '../../../iam/model/user.entity';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-course-view-page',
  imports: [
    AssignmentList,
    MatButton,
    RouterLink,
    MatIcon
  ],
  templateUrl: './course-view-page.html',
  standalone: true,
  styleUrl: './course-view-page.css'
})
export class CourseViewPage implements OnInit {

  userRole: string = "";

  teacher: User | undefined;

  preCourseId: number | undefined = undefined;

  course: Course | undefined;

  constructor(
    private coursesService: CoursesService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute,
    private loadingService: LoadingService,
    private dialog: MatDialog,
    private authService: AuthService) {}

  ngOnInit() {
    if (!this.tokenService.isLoggedIn)
    {
      this.router.navigate(["/no-access"])
    }

    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.preCourseId = +courseIdParam;
    }

    this.FetchUserRole()
    this.FetchCourseInfo()
  }

  FetchCourseInfo(): void {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    this.coursesService.getById(this.preCourseId).subscribe({
      next: result => {
        this.course = result;
      }, error: err => {
        console.log(err);
        fetchEnded.emit()
        this.router.navigate(["/no-access"]).then(r => {});
      },
      complete: () => {
        fetchEnded.emit()
        this.FetchTeacherData()
      }
    })
  }

  OpenCreateDialog(): void {
    this.dialog.open(CreateAssignmentDialog, {
      data: {
        courseId: this.preCourseId,
      },
      hasBackdrop: true,
      disableClose: true
    })
  }

  FetchUserRole() {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    this.authService.fetchLoggedUser().subscribe({
      next: result => {
        this.userRole = result.roles[0];
      },
      error: err => {
        console.log(err);
        fetchEnded.emit();
      },
      complete: () => {
        fetchEnded.emit();
      }
    })
  }

  FetchTeacherData() {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    this.authService.getById(this.course?.teacherId).subscribe({
      next: result => {
        this.teacher = result;
      },
      error: err => {
        console.log(err);
        fetchEnded.emit()
      },
      complete: () => {
        fetchEnded.emit()
      }
    })
  }

}
