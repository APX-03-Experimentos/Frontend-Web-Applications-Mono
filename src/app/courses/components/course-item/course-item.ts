import {Component, Input} from '@angular/core';
import {MatCard, MatCardContent, MatCardImage} from '@angular/material/card';
import {Course} from '../../model/course.entity';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-course-item',
  imports: [
    MatCard,
    MatCardContent,
    MatCardImage,
    MatButton,
    RouterLink,
    MatIcon,
    TranslatePipe
  ],
  templateUrl: './course-item.html',
  standalone: true,
  styleUrl: './course-item.css'
})
export class CourseItem {
  @Input() course: Course | undefined;
}
