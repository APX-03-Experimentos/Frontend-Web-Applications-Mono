export class Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  ocurredAt: string;
  sourceCodeId: number;
  sourceAssignmentId: number;

  constructor(notification: {
    id: number;
    userId: number;
    title: string;
    message: string;
    type: string;
    read: boolean;
    ocurredAt: string;
    sourceCodeId: number;
    sourceAssignmentId: number;
  }) {
    this.id = notification.id;
    this.userId = notification.userId;
    this.title = notification.title;
    this.message = notification.message;
    this.type = notification.type;
    this.read = notification.read;
    this.ocurredAt = notification.ocurredAt;
    this.sourceCodeId = notification.sourceCodeId;
    this.sourceAssignmentId = notification.sourceAssignmentId;
  }
}
