import {Component, Input, OnInit} from '@angular/core';
import {AssignmentsService} from '../../services/assignments.service';
import {AssignmentItem} from '../assignment-item/assignment-item';
import {Assignment} from '../../model/assignment.entity';
import {LoadingService} from '../../../shared/services/loading.service';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-assignment-list',
  imports: [
    AssignmentItem,
    TranslatePipe
  ],
  templateUrl: './assignment-list.html',
  standalone: true,
  styleUrl: './assignment-list.css'
})
export class AssignmentList implements OnInit {

  @Input() courseId: number | undefined;

  assignments: Assignment[] = [];

  constructor(private assignmentsService: AssignmentsService, private loadingService: LoadingService) {}

  ngOnInit() {
    this.assignmentsService.assignmentsUpdated.subscribe({
      next: () => {
        this.FetchAssignments()
      }
    })
    this.FetchAssignments()
  }

  FetchAssignments(): void {
    if (this.courseId != undefined) {
      this.loadingService.startLoadingDialog();
      this.assignmentsService.GetAssignmentsByCourseId(this.courseId).subscribe({
        next: data => {
          this.assignments = data;
          this.assignments.reverse();
          console.log(this.assignments)
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

}
