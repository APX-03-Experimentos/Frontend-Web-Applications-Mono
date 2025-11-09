import { Routes } from '@angular/router';
import {AuthPage} from './iam/pages/auth-page/auth-page';
import {CoursesPage} from './courses/pages/courses-page/courses-page';
import {NoAccessPageComponent} from './public/pages/no-access-page/no-access-page.component';
import {CourseViewPage} from './courses/pages/course-view-page/course-view-page';
import {AssignmentViewPage} from './assignments/pages/assignment-view-page/assignment-view-page';
import {CourseAnalyticsPage} from './analytics/pages/course-analytics/course-analytics-page.component';
import {CourseMembersPage} from './courses/pages/course-members-page/course-members-page';
import { UserManagementPageComponent } from './administrator/pages/user-management-page';
import { CourseManagementPage } from './administrator/pages/course-management-page/course-management-page';

import { AssignmentManagementPageComponent } from './administrator/pages/assignment-management-page/assignment-management-page';
import {SaasPage} from './iam/pages/saas-page/saas-page';
import {ComplaintsPage} from './iam/pages/complaints-page/complaints-page';
export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: 'auth', component: AuthPage },
  { path: 'courses', component: CoursesPage },
  { path: 'course/:courseId', component: CourseViewPage },
  { path: 'course/:courseId/members', component: CourseMembersPage },
  { path: 'course/:courseId/analytics', component: CourseAnalyticsPage },
  { path: 'assignment/:assignmentId', component: AssignmentViewPage },

  { path: 'admin/users', component: UserManagementPageComponent },
  { path: 'admin/courses', component: CourseManagementPage },
  { path: 'admin/assignments', component: AssignmentManagementPageComponent },

  { path: 'saas', component: SaasPage},
  { path: 'complaints', component: ComplaintsPage},

  { path: 'no-access', component: NoAccessPageComponent },
  { path: '**', redirectTo: '/auth' }
];
