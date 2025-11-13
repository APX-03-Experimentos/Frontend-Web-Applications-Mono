import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {Submission} from '../../model/submission.entity';
import {MatIcon} from '@angular/material/icon';
import {User} from '../../../iam/model/user.entity';
import {AuthService} from '../../../iam/services/auth.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {MatDialog} from '@angular/material/dialog';
import {SubmissionContentDialog} from '../submission-content-dialog/submission-content-dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-submission-item',
  imports: [
    MatCard,
    MatButton,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './submission-item.html',
  standalone: true,
  styleUrl: './submission-item.css'
})
export class SubmissionItem implements OnInit {
  @Input() submission: Submission | undefined;

  owner: User | undefined;

  constructor(private authService: AuthService,
              private loadingService: LoadingService,
              private dialog: MatDialog) {}

  ngOnInit() {
    this.FetchUserInfo()
  }

  FetchUserInfo() {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    this.authService.getById(this.submission?.studentId).subscribe({
      next: result => {
        this.owner = result;
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

  OpenContent(): void {
    this.dialog.open(SubmissionContentDialog, {
      data: {
        submission: this.submission,
      },
      hasBackdrop: true
    })
  }
}
