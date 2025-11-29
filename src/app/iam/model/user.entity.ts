export type Role = 'ROLE_STUDENT' | 'ROLE_TEACHER';
export class User {
  id: number;
  username: string;
  token: string;
  roles: Role[];

  constructor(user:{id?: number, username?: string, token?: string, roles?: Role[]}) {
    this.id = user.id || 0;
    this.username = user.username || '';
    this.token = user.token || '';
    this.roles = user.roles || [];
  }
}
