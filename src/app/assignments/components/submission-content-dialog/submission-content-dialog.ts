import {Component, EventEmitter, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {Submission} from '../../model/submission.entity';
import {AuthService} from '../../../iam/services/auth.service';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {SubmissionsService} from '../../services/submissions.service';
import {LoadingService} from '../../../shared/services/loading.service';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-submission-content-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatError,
    ReactiveFormsModule,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './submission-content-dialog.html',
  standalone: true,
  styleUrl: './submission-content-dialog.css'
})
export class SubmissionContentDialog implements OnInit {

  gradeForm: FormGroup;

  userRole: string = "";

  constructor(
    private fb: FormBuilder,
    private submissionsService: SubmissionsService,
    @Inject(MAT_DIALOG_DATA) public data: {submission: Submission},
    private dialogRef: MatDialogRef<SubmissionContentDialog>,
    private authService: AuthService,
    private loadingService: LoadingService
  ) {
    this.gradeForm = this.fb.group({
      grade: [
        '',
        [
          Validators.required,
          Validators.min(0),
          Validators.max(20)
        ]
      ]
    });
  }

  ngOnInit() {
    this.FetchUserRole()
  }

  FetchUserRole(): void {
    this.authService.fetchLoggedUser().subscribe({
      next: result => {
        this.userRole = result.roles[0]
      },
      error: err => {
        console.log(err);
      }
    })
  }

  submitGrade() {
    if (this.gradeForm.valid) {
      const grade = this.gradeForm.value.grade;
      console.log("Nota enviada:", grade);
      let submitted = new EventEmitter();
      this.loadingService.LoadingDialog(submitted)
      this.submissionsService.GradeSubmission(this.data.submission.id, grade).subscribe({
        next: () => {
          this.submissionsService.EmitUpdate();
        },
        error: err => {
          console.log(err);
          submitted.emit()
        },
        complete: () => {
          submitted.emit()
        }
      })

      this.dialogRef.close();
    }
  }

  async DownloadAllFilesAsZip(): Promise<void> {

    let downloadEnded = new EventEmitter();
    this.loadingService.LoadingDialog(downloadEnded)

    if (!this.data.submission?.fileUrls || this.data.submission.fileUrls.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("archivos")!;

    for (let i = 0; i < this.data.submission.fileUrls.length; i++) {
      const url = this.data.submission.fileUrls[i];
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = url.split('/').pop() || `archivo_${i + 1}`;
      folder.file(fileName, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "archivos.zip");

    downloadEnded.emit()
  }

  GetFileName(url: string): string {
    try {
      return decodeURIComponent(url.split('/').pop() || 'archivo');
    } catch {
      return 'archivo';
    }
  }

}
