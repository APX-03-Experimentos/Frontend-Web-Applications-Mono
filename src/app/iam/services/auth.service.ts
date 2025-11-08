import {EventEmitter, Injectable} from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {User} from '../model/user.entity';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';

const usersResourceEndpoint = environment.usersEndpointPath;
const authenticationResourceEndpoint = environment.authenticationEndpointPath;
@Injectable({
  providedIn: 'root'
})
export class AuthService extends BaseService<User> {

  private readonly authenticationPath: string;

  public updatedUsers: EventEmitter<any> = new EventEmitter();

  constructor() {
    super();
    this.resourceEndpoint = usersResourceEndpoint;
    this.authenticationPath = authenticationResourceEndpoint;
  }

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.serverBaseUrl}${this.authenticationPath}/sign-in`, {
      "userName": username,
      "password": password
    }, this.httpOptions);
  }

  signup(username: string, password: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.serverBaseUrl}${this.authenticationPath}/sign-up`, {
      "userName": username,
      "password": password,
      "roles": [
        role
      ],
    }, this.httpOptions);
  }

  fetchLoggedUser(): Observable<User> {
    return this.http.get<User>(`${this.resourcePath()}/me`, this.httpOptions)
  }

  GetStudentsFromCourse(courseId: number | undefined): Observable<User[]> {
    return this.http.get<User[]>(`${this.resourcePath()}/group/${courseId}`, this.httpOptions);
  }
}
