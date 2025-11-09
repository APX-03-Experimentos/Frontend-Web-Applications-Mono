import { Component } from '@angular/core';
import {MatCheckbox} from '@angular/material/checkbox';
import {RouterLink} from '@angular/router';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-saas-page',
  imports: [
    MatCheckbox,
    RouterLink,
    NgOptimizedImage
  ],
  templateUrl: './saas-page.html',
  standalone: true,
  styleUrl: './saas-page.css'
})
export class SaasPage {

}
