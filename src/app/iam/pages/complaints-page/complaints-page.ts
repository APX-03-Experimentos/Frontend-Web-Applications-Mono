import { Component } from '@angular/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatButton} from '@angular/material/button';
import {MatInput} from '@angular/material/input';
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-complaints-page',
  imports: [
    MatFormField,
    MatButton,
    MatInput,
    MatLabel,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './complaints-page.html',
  standalone: true,
  styleUrl: './complaints-page.css'
})
export class ComplaintsPage {

}
