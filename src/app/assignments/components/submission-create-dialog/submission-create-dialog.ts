import {Component, EventEmitter, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {CreateAssignmentDialog} from '../create-assignment-dialog/create-assignment-dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {AssignmentsService} from '../../services/assignments.service';
import {SubmissionsService} from '../../services/submissions.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-submission-create-dialog',
  imports: [
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatDialogActions,
    MatButton,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './submission-create-dialog.html',
  standalone: true,
  styleUrl: './submission-create-dialog.css'
})
export class SubmissionCreateDialog {

  selectedFiles: File[] = [];
  content: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {assignmentId: number},
    protected dialogRef: MatDialogRef<SubmissionCreateDialog>,
    private submissionsService: SubmissionsService,
    private loadingService: LoadingService) {
  }

  SendSubmission(): void {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    fetchEnded.subscribe({
      next: () => {
        this.dialogRef.close();
      }
    })
    this.submissionsService.SendSubmission({
      assignmentId: this.data.assignmentId,
      content: this.content,
      imageUrl: "test",
    }).subscribe({
      next: (result) => {
        if (this.selectedFiles.length > 0) {
          let filesUploaded = new EventEmitter();
          this.loadingService.LoadingDialog(filesUploaded);
          console.log("Selected files detected, attempting to upload");
          this.submissionsService.AddFilesToSubmission(result.id, this.selectedFiles).subscribe({
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

        this.submissionsService.EmitUpdate()
      }, error: err => {
        console.log(err);
        fetchEnded.emit()
      },
      complete: () => {
        fetchEnded.emit()
      }
    })
  }

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

}
