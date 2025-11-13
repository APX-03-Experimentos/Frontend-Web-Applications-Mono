import {Component, OnInit} from '@angular/core';
import {CoursesService} from '../../services/courses.service';
import {Course} from '../../model/course.entity';
import {LoadingService} from '../../../shared/services/loading.service';
import {CourseItem} from '../course-item/course-item';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-course-list',
  imports: [
    CourseItem,
    TranslatePipe
  ],
  templateUrl: './course-list.html',
  standalone: true,
  styleUrl: './course-list.css'
})
export class CourseList implements OnInit {

  courses: Course[] = [];

  constructor(private coursesService: CoursesService, private loadingService:LoadingService) {}

  ngOnInit() {
    this.fetchCourses();
    this.coursesService.updatedCourses.subscribe({
      next: () => {
        this.fetchCourses();
      }
    })
  }

  fetchCourses(): void {
    this.loadingService.startLoadingDialog();
    this.coursesService.GetCoursesFromLoggedInUser().subscribe({
      next: result => {
        this.courses = result;
        console.log(this.courses);
      },
      error: err => {
        console.log(err);
        this.loadingService.stopLoadingDialog()
      },
      complete: () => {
        this.loadingService.stopLoadingDialog()
      }
    })
  }
}
