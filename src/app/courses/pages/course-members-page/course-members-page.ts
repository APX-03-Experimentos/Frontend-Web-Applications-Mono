import {Component, EventEmitter, OnInit} from '@angular/core';
import {TokenService} from '../../../shared/services/token.service';
import {AuthService} from '../../../iam/services/auth.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {ActivatedRoute, Router} from '@angular/router';
import {User} from '../../../iam/model/user.entity';
import {CoursesService} from '../../services/courses.service';
import {Course} from '../../model/course.entity';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-course-members-page',
  imports: [
    TranslatePipe
  ],
  templateUrl: './course-members-page.html',
  standalone: true,
  styleUrl: './course-members-page.css'
})
export class CourseMembersPage implements OnInit {

  preCourseId: number | undefined;

  students: User[] = [];

  teacher: User | undefined;

  course: Course | undefined;
  courseFetched = new EventEmitter();

  constructor(
    private coursesService: CoursesService,
    private tokenService: TokenService,
    private authService: AuthService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
  }

  ngOnInit() {

    if (!this.tokenService.isLoggedIn)
    {
      this.router.navigate(["/no-access"])
    }

    const courseIdParam = this.route.snapshot.paramMap.get('courseId');
    if (courseIdParam) {
      this.preCourseId = +courseIdParam;
    }

    this.fetchCourseStudents()
    this.authService.updatedUsers.subscribe({
      next: () => {
        this.fetchCourseStudents()
      }
    })
    this.fetchCourseInfo()
    this.courseFetched.subscribe({
      next: () => {
        this.fetchTeacherInfo()
      }
    })


  }

  fetchCourseStudents() {
    let fetchEnded = new EventEmitter()
    this.loadingService.LoadingDialog(fetchEnded)
    this.authService.GetStudentsFromCourse(this.preCourseId).subscribe({
      next: (result) => {
        this.students = result;
        fetchEnded.emit();
      },
      error: err => {
        console.log(err);
        fetchEnded.emit();
      }
    })
  }

  fetchCourseInfo() {
    let fetchEnded = new EventEmitter()
    this.loadingService.LoadingDialog(fetchEnded)
    this.coursesService.getById(this.preCourseId).subscribe({
      next: (result) => {
        this.course = result;
        fetchEnded.emit();
        this.courseFetched.emit()
      },
      error: (err) => {
        console.log(err);
        fetchEnded.emit()
      }
    })
  }

  fetchTeacherInfo() {
    let fetchEnded = new EventEmitter()
    this.loadingService.LoadingDialog(fetchEnded)
    this.authService.getById(this.course!.teacherId).subscribe({
      next: (result) => {
        this.teacher = result;
        fetchEnded.emit()
      },
      error: (err) => {
        console.log(err);
        fetchEnded.emit()
      }
    })
  }

  kickStudent(studentId: number) {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded)
    this.coursesService.KickStudentFromCourse(this.preCourseId!, studentId).subscribe({
      next: () => {
        console.log("Kicked student with id: " + studentId)
        this.authService.updatedUsers.emit()
        fetchEnded.emit();
      },
      error: (err) => {
        console.log(err);
        fetchEnded.emit();
      }
    })
  }

}
