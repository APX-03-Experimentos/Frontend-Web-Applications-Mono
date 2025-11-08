import {EventEmitter, Injectable} from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {Submission} from '../model/submission.entity';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionsService extends BaseService<Submission> {

  submissionsUpdated: EventEmitter<any> = new EventEmitter();

  constructor() {
    super();
    this.resourceEndpoint = environment.submissionsEndpointPath;
  }

  GetSubmissionsByAssignmentId(assignmentId: number): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.resourcePath()}/assignment/${assignmentId}`, this.httpOptions)
  }

  GetSubmissionsByCourseId(courseId: number | undefined): Observable<Submission[]> {
    return this.http.get<Submission[]>(`${this.resourcePath()}/course/${courseId}`, this.httpOptions)
  }

  SendSubmission(submission:{assignmentId: number, content: string, imageUrl: string}): Observable<Submission> {
    console.log(submission)
    return this.http.post<Submission>(`${this.resourcePath()}`, {
      assignmentId: submission.assignmentId,
      content: submission.content,
      imageUrl: submission.imageUrl,
    },this.httpOptions)
  }

  GradeSubmission(submissionId: number, grade: number): Observable<Submission> {
    return this.http.put<Submission>(`${this.resourcePath()}/${submissionId}/grade`, {
      score: grade
    }, this.httpOptions)
  }

  EmitUpdate(): void {
    this.submissionsUpdated.emit();
  }

  AddFilesToSubmission(id: number, files: File[]): Observable<String[]> {
    const formData = new FormData();

    files.forEach(file => {
      formData.append('files', file);
    })

    return this.http.post<String[]>(`${this.resourcePath()}/${id}/files`, formData, this.fileHttpOptions)
  }

}
