import {Component, EventEmitter, Input, OnInit} from '@angular/core';
import {SubmissionItem} from '../submission-item/submission-item';
import {SubmissionsService} from '../../services/submissions.service';
import {LoadingService} from '../../../shared/services/loading.service';
import {Submission} from '../../model/submission.entity';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-submission-list',
  imports: [
    SubmissionItem,
    TranslatePipe
  ],
  templateUrl: './submission-list.html',
  standalone: true,
  styleUrl: './submission-list.css'
})
export class SubmissionList implements OnInit {
  @Input() assignmentId: number = 0;

  submissions: Submission[] = [];

  constructor(private submissionsService: SubmissionsService,
              private loadingService: LoadingService) {}

  ngOnInit() {
    this.submissionsService.submissionsUpdated.subscribe({
      next: () => {
        this.FetchSubmissions()
      }
    })
    this.FetchSubmissions()
  }

  FetchSubmissions(): void {
    let fetchEnded = new EventEmitter();
    this.loadingService.LoadingDialog(fetchEnded);
    this.submissionsService.GetSubmissionsByAssignmentId(this.assignmentId).subscribe({
      next: data => {
        this.submissions = data;
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
}
