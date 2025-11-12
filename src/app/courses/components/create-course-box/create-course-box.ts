import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {CreateCourseDialog} from '../create-course-dialog/create-course-dialog';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-create-course-box',
  imports: [
    MatIcon,
    MatIconButton,
    TranslatePipe
  ],
  templateUrl: './create-course-box.html',
  standalone: true,
  styleUrl: './create-course-box.css'
})
export class CreateCourseBox {

  constructor(private dialog: MatDialog) {}

  OpenDialog() {
    this.dialog.open(CreateCourseDialog, {
      disableClose: true,
      hasBackdrop: true
    });
  }

}
