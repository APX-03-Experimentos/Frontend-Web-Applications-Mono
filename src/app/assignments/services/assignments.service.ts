import {EventEmitter, Injectable} from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {Assignment} from '../model/assignment.entity';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AssignmentsService extends BaseService<Assignment>{

  assignmentsUpdated: EventEmitter<any> = new EventEmitter();

  constructor() {
    super();
    this.resourceEndpoint = environment.assignmentsEndpointPath;
  }

  EmitUpdate(): void {
    this.assignmentsUpdated.emit();
  }

  GetAssignmentsByCourseId(courseId: number | undefined): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.resourcePath()}/course/${courseId}`, this.httpOptions)
  }

  CreateAssignment(assignment: {title: string, description: string, courseId: number, deadline: string, imageUrl: string}): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.resourcePath()}`, assignment, this.httpOptions)
  }

  AddFilesToAssignment(id: number, files: File[]): Observable<String[]> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    })

    return this.http.post<String[]>(`${this.resourcePath()}/${id}/files`, formData, this.fileHttpOptions)
  }

}
