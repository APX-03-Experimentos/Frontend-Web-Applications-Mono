import { Component } from '@angular/core';
import {MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatHint, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {LoadingService} from '../../../shared/services/loading.service';
import {CoursesService} from '../../services/courses.service';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-create-course-dialog',
  imports: [
    MatDialogContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatHint,
    MatError,
    TranslatePipe
  ],
  templateUrl: './create-course-dialog.html',
  standalone: true,
  styleUrl: './create-course-dialog.css'
})
export class CreateCourseDialog {

  title: string = "";

  constructor(private dialogRef: MatDialogRef<CreateCourseDialog>, private loadingService:LoadingService, private coursesService:CoursesService) {}

  Create(): void {
    this.loadingService.startLoadingDialog()
    this.coursesService.CreateCourse({title: this.title}).subscribe({
      next: () => {
        this.coursesService.EmitUpdatedCourses();
      },
      error: err => {
        console.log(err);
        this.loadingService.stopLoadingDialog()
      },
      complete: () => {
        this.loadingService.stopLoadingDialog()
      }
    })
    this.dialogRef.close();
  }

  Cancel(): void {
    this.dialogRef.close();
  }

}
