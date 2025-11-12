import {Component, EventEmitter, Inject, ChangeDetectionStrategy} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {FormsModule} from '@angular/forms';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {AssignmentsService} from '../../services/assignments.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {MatNativeDateModule} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-create-assignment-dialog',
  providers: [provideNativeDateAdapter()],
  imports: [
    MatDialogContent,
    MatFormField,
    FormsModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatNativeDateModule,
    MatDialogActions,
    MatButton,
    MatInput,
    MatLabel,
    MatInputModule,
    MatFormFieldModule,
    MatDatepickerModule,
    TranslatePipe,
  ],
  templateUrl: './create-assignment-dialog.html',
  standalone: true,
  styleUrl: './create-assignment-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAssignmentDialog {

  selectedFiles: File[] = [];
  title: string = '';
  description: string = '';
  deadline!: Date;
  minDate: Date = new Date(new Date().setDate(new Date().getDate() + 1));


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {courseId: number},
    public dialogRef: MatDialogRef<CreateAssignmentDialog>,
    private assignmentService: AssignmentsService,
    private loadingService: LoadingService,
  ) {
    this.deadline = this.minDate
  }

  OnSave(): void {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    this.assignmentService.CreateAssignment({
      title: this.title,
      description: this.description,
      courseId: this.data.courseId,
      deadline: this.deadline.toISOString(),
      imageUrl: "",
    }).subscribe({
      next: (result) => {
        if (this.selectedFiles.length > 0) {
          let filesUploaded = new EventEmitter();
          this.loadingService.LoadingDialog(filesUploaded);
          console.log("Selected files detected, attempting to upload");
          this.assignmentService.AddFilesToAssignment(result.id, this.selectedFiles).subscribe({
            next: (array) => {
              console.log(`Uploaded successfully: ${array}`);
            },
            error: (err) => {
              console.log(err)
              filesUploaded.emit()
            },
            complete: () => {
              filesUploaded.emit()
            }
          });
        }
        this.assignmentService.EmitUpdate()
      },
      error: (err) => {
        console.log(err)
        fetchEnded.emit()
        this.dialogRef.close();
      },
      complete: () => {
        fetchEnded.emit()
        this.dialogRef.close();
      }
    })
  }

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }
}
