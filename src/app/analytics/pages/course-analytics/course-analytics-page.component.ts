import { Component, EventEmitter, OnInit, ChangeDetectorRef } from '@angular/core';
import { CoursesService } from '../../../courses/services/courses.service';
import { AuthService } from '../../../iam/services/auth.service';
import { AssignmentsService } from '../../../assignments/services/assignments.service';
import { SubmissionsService } from '../../../assignments/services/submissions.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../../shared/services/loading.service';
import { Course } from '../../../courses/model/course.entity';
import { User } from '../../../iam/model/user.entity';
import { Assignment } from '../../../assignments/model/assignment.entity';
import { Submission } from '../../../assignments/model/submission.entity';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-course-analytics',
  templateUrl: './course-analytics-page.component.html',
  standalone: true,
  imports: [BaseChartDirective, CommonModule, MatIcon, TranslatePipe],
  styleUrl: './course-analytics-page.component.css'
})
export class CourseAnalyticsPage implements OnInit {
  courseId: number | undefined;
  course: Course | undefined;
  students: User[] = [];
  assignments: Assignment[] = [];
  submissions: Submission[] = [];

  selectedTab = 0;

  chartTabs = [
    { label: 'Porcentaje de Entregas' },
    { label: 'Promedio por Asignación' },
    { label: 'Estado de Calificaciones' },
    { label: 'Distribución de Calificaciones' }
  ];

  assignmentSubmissionRate: number[] = [];
  averageScores: number[] = [];
  gradedCount = 0;
  notGradedCount = 0;

  // Nuevo chart para distribución de calificaciones
  public scoreDistributionLabels: string[] = ['0-4', '5-9', '10-14', '15-20'];
  public scoreDistributionData: number[] = [0, 0, 0, 0];

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Asignaciones'
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Porcentaje de entregas'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Entregas: ${context.raw}%`;
          }
        }
      }
    }
  };

  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Porcentaje de entregas',
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 20,
        ticks: {
          stepSize: 5
        }
      }
    }
  };

  public radarChartLabels: string[] = [];
  public radarChartType: ChartType = 'radar';
  public radarChartData: ChartData<'radar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Calificación promedio',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        pointBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
      }
    ]
  };

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw as number;
            const total = (context.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  public doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Calificadas', 'Sin calificar'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 159, 64, 0.8)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)'],
        borderWidth: 1
      }
    ]
  };

  public doughnutChartType: ChartType = 'doughnut';

  // Chart para distribución de calificaciones
  public distributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Rangos de calificación'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de estudiantes'
        }
      }
    }
  };

  public distributionChartType: ChartType = 'bar';
  public distributionChartData: ChartData<'bar'> = {
    labels: this.scoreDistributionLabels,
    datasets: [
      {
        data: [],
        label: 'Estudiantes',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  constructor(
    private coursesService: CoursesService,
    private authService: AuthService,
    private assignmentsService: AssignmentsService,
    private submissionsService: SubmissionsService,
    private loadingService: LoadingService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef // Inyectar ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const courseIdParam = params.get('courseId');
      if (courseIdParam) {
        this.courseId = +courseIdParam;

        let fetchEnded = new EventEmitter();
        this.loadingService.LoadingDialog(fetchEnded);

        forkJoin({
          course: this.coursesService.getById(this.courseId),
          students: this.authService.GetStudentsFromCourse(this.courseId),
          assignments: this.assignmentsService.GetAssignmentsByCourseId(this.courseId),
          submissions: this.submissionsService.GetSubmissionsByCourseId(this.courseId)
        }).subscribe({
          next: ({ course, students, assignments, submissions }) => {
            this.course = course;
            this.students = students;
            this.assignments = assignments;
            this.submissions = submissions;
            this.prepareChartData();
          },
          error: (err) => {
            console.error(err);
            fetchEnded.emit();
          },
          complete: () => fetchEnded.emit()
        });
      }
    });
  }

  prepareChartData(): void {
    if (this.assignments.length === 0 || this.submissions.length === 0 || this.students.length === 0) {
      return;
    }

    // Actualizar datos del chart de porcentaje de entregas
    this.barChartData = {
      ...this.barChartData,
      labels: this.assignments.map(a => a.title),
      datasets: [
        {
          ...this.barChartData.datasets[0],
          data: this.assignments.map(assignment => {
            const assignmentSubmissions = this.submissions.filter(s => s.assignmentId === assignment.id);
            const submissionRate = (assignmentSubmissions.length / this.students.length) * 100;
            return Math.round(submissionRate);
          })
        }
      ]
    };

    // Actualizar datos del chart radar
    this.radarChartData = {
      ...this.radarChartData,
      labels: this.assignments.map(a => a.title),
      datasets: [
        {
          ...this.radarChartData.datasets[0],
          data: this.assignments.map(assignment => {
            const gradedSubmissions = this.submissions.filter(s =>
              s.assignmentId === assignment.id && s.status === 'GRADED'
            );

            if (gradedSubmissions.length === 0) return 0;

            const totalScore = gradedSubmissions.reduce((sum, submission) => sum + submission.score, 0);
            return Math.round((totalScore / gradedSubmissions.length) * 10) / 10;
          })
        }
      ]
    };

    // Actualizar datos del chart doughnut
    this.gradedCount = this.submissions.filter(s => s.status === 'GRADED').length;
    this.notGradedCount = this.submissions.filter(s => s.status === 'NOT GRADED').length;
    this.doughnutChartData = {
      ...this.doughnutChartData,
      datasets: [
        {
          ...this.doughnutChartData.datasets[0],
          data: [this.gradedCount, this.notGradedCount]
        }
      ]
    };

    // Preparar datos para el chart de distribución de calificaciones
    this.prepareScoreDistributionData();

    // Forzar la detección de cambios
    this.cdRef.detectChanges();
  }

  prepareScoreDistributionData(): void {
    // Reiniciar datos
    this.scoreDistributionData = [0, 0, 0, 0];

    // Contar estudiantes por rango de calificación
    this.submissions
      .filter(s => s.status === 'GRADED')
      .forEach(submission => {
        if (submission.score >= 0 && submission.score <= 4) {
          this.scoreDistributionData[0]++;
        } else if (submission.score >= 5 && submission.score <= 9) {
          this.scoreDistributionData[1]++;
        } else if (submission.score >= 10 && submission.score <= 14) {
          this.scoreDistributionData[2]++;
        } else if (submission.score >= 15 && submission.score <= 20) {
          this.scoreDistributionData[3]++;
        }
      });

    // Actualizar chart de distribución
    this.distributionChartData = {
      ...this.distributionChartData,
      datasets: [
        {
          ...this.distributionChartData.datasets[0],
          data: this.scoreDistributionData
        }
      ]
    };
  }

  chartClicked({ event, active }: { event?: ChartEvent, active?: object[] }): void {
    console.log(event, active);
  }

  chartHovered({ event, active }: { event?: ChartEvent, active?: object[] }): void {
    console.log(event, active);
  }

  calculateOverallAverage(): string {
    if (this.averageScores.length === 0) return 'N/A';

    const validScores = this.averageScores.filter(score => score > 0);
    if (validScores.length === 0) return 'N/A';

    const total = validScores.reduce((sum, score) => sum + score, 0);
    const average = total / validScores.length;
    return average.toFixed(1);
  }

  getSubmissionCount(assignmentId: number): number {
    return this.submissions.filter(s => s.assignmentId === assignmentId).length;
  }
}
