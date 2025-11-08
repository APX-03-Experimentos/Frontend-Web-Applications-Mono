import {EventEmitter, Injectable} from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {Course} from '../model/course.entity';
import {environment} from '../../../environments/environment';
import {map, Observable, switchMap} from 'rxjs';
import {AuthService} from '../../iam/services/auth.service';
import {User} from '../../iam/model/user.entity';

@Injectable({
  providedIn: 'root'
})
export class CoursesService extends BaseService<Course> {

  public updatedCourses: EventEmitter<any> = new EventEmitter();

  constructor(private authService: AuthService) {
    super();
    this.resourceEndpoint = environment.coursesEndpointPath;
  }

  GetCoursesFromLoggedInUser(): Observable<Course[]> {
    return this.authService.fetchLoggedUser().pipe(
        map(result => result.roles[0] === 'ROLE_TEACHER' ? 'teacher' : 'student'),
        switchMap(type => this.http.get<Course[]>(`${this.resourcePath()}/${type}`, this.httpOptions))
    );
  }

  CreateCourse(course: {title:string}): Observable<Course> {
    return this.http.post<Course>(`${this.resourcePath()}`, JSON.stringify(course), this.httpOptions)
  }

  JoinCourse(key: string): Observable<Course> {
    return this.http.post<Course>(`${this.resourcePath()}/join/${key}`, {}, this.httpOptions)
  }

  KickStudentFromCourse(courseId: number, studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.resourcePath()}/${courseId}/students/${studentId}`, this.httpOptions)
  }

  EmitUpdatedCourses(): void
  {
    this.updatedCourses.emit();
  }
}
