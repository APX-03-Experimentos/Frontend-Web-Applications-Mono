import {Component, ElementRef, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {Assignment} from '../../model/assignment.entity';
import {TokenService} from '../../../shared/services/token.service';
import {ActivatedRoute, Router} from '@angular/router';
import {AssignmentsService} from '../../services/assignments.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {NgOptimizedImage} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {SubmissionList} from '../../components/submission-list/submission-list';
import {User} from '../../../iam/model/user.entity';
import {AuthService} from '../../../iam/services/auth.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {SubmissionCreateDialog} from '../../components/submission-create-dialog/submission-create-dialog';
import JSZip from 'jszip';
import {saveAs} from 'file-saver';
import {finalize} from 'rxjs';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-assignment-view-page',
  imports: [
    NgOptimizedImage,
    MatIcon,
    SubmissionList,
    MatButton,
    MatIconButton,
    TranslatePipe
  ],
  templateUrl: './assignment-view-page.html',
  standalone: true,
  styleUrl: './assignment-view-page.css'
})
export class AssignmentViewPage implements OnInit {

  @ViewChild('assignmentFileInput') assignmentFileInput!: ElementRef<HTMLInputElement>;

  preAssignmentId: number = 0;

  userRole: string = "";
  assignment: Assignment | undefined;

  constructor(private tokenService: TokenService,
              private router: Router,
              private assignmentService: AssignmentsService,
              private route: ActivatedRoute,
              private loadingService: LoadingService,
              private authService: AuthService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    if (!this.tokenService.isLoggedIn)
    {
      this.router.navigate(["/no-access"])
    }

    const preAssignmentIdParam = this.route.snapshot.paramMap.get('assignmentId');
    if (preAssignmentIdParam) {
      this.preAssignmentId = +preAssignmentIdParam;
    }

    this.FetchUserRole();
    this.FetchAssignmentInfo();
    this.assignmentService.assignmentsUpdated.subscribe(() => {
      this.FetchAssignmentInfo();
    });
  }
  FetchAssignmentInfo() {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded)
    this.assignmentService.getById(this.preAssignmentId).subscribe({
      next: result => {
        this.assignment = result;
        console.log(this.assignment)
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

  GetFormattedDate(): string {
    if (!this.assignment?.deadline) return '';
    const date = new Date(this.assignment.deadline);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  OpenCreateSubmissionDialog(): void {
    this.dialog.open(SubmissionCreateDialog, {
      data: {
        assignmentId: this.preAssignmentId
      },
      hasBackdrop: true,
      disableClose: true
    })
  }

  async DownloadAllFilesAsZip(): Promise<void> {

    let downloadEnded = new EventEmitter();
    this.loadingService.LoadingDialog(downloadEnded)

    if (!this.assignment?.fileUrls || this.assignment.fileUrls.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder("archivos")!;

    for (let i = 0; i < this.assignment.fileUrls.length; i++) {
      const url = this.assignment.fileUrls[i];
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

  OpenFilePickerForAssignmentFiles(): void {
    if (!this.assignment) {
      console.warn('Assignment not loaded yet.');
      return;
    }
    this.assignmentFileInput.nativeElement.click();
  }

  // --- Handler cuando el usuario selecciona archivos ---
  OnAssignmentFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0 || !this.assignment) {
      // limpiar input por si acaso
      if (input) input.value = '';
      return;
    }

    const files = Array.from(input.files);

    let uploadEnded = new EventEmitter();
    this.loadingService.LoadingDialog(uploadEnded);

    this.assignmentService.AddFilesToAssignment(this.assignment.id, files)
      .pipe(finalize(() => uploadEnded.emit()))
      .subscribe({
        next: () => {
          this.assignment!.fileUrls = [
            ...(this.assignment!.fileUrls || []),
          ];
          this.assignmentService.EmitUpdate();
          this.assignmentFileInput.nativeElement.value = '';
        },
        error: (err) => {
          console.error('Error subiendo archivos de tarea:', err);
          this.assignmentFileInput.nativeElement.value = '';
        }
      });
  }

  RemoveFile(fileUrl: string): void {
    if (!this.assignment) return;

    let deleteEnded = new EventEmitter();
    this.loadingService.LoadingDialog(deleteEnded);

    this.assignmentService.RemoveFileFromAssignment(this.assignment.id, fileUrl)
      .pipe(finalize(() => deleteEnded.emit()))
      .subscribe({
        next: () => {
          this.assignment!.fileUrls = this.assignment!.fileUrls?.filter(url => url !== fileUrl);
        },
        error: err => {
          console.error('Error al eliminar el archivo:', err);
        }
      });
  }
}
