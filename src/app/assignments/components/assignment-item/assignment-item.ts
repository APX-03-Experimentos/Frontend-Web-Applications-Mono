import {Component, Input} from '@angular/core';
import {MatCard} from '@angular/material/card';
import {Assignment} from '../../model/assignment.entity';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {User} from '../../../iam/model/user.entity';
import {AuthService} from '../../../iam/services/auth.service';
import {SubmissionsService} from '../../services/submissions.service';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-assignment-item',
  imports: [
    MatCard,
    MatButton,
    RouterLink,
    MatIcon
  ],
  templateUrl: './assignment-item.html',
  standalone: true,
  styleUrl: './assignment-item.css'
})
export class AssignmentItem {
  @Input() assignment: Assignment | undefined;

  GetFormattedDate(): string {
    if (!this.assignment?.deadline) return '';
    const date = new Date(this.assignment.deadline);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}
