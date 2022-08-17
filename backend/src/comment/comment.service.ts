import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentService {
  private comments: Array<{ id: string; value: string; username?: string }> = [
    { id: '1', value: 'Awesome!' },
    { id: '2', value: 'This Sucks balls' },
    { id: '3', value: 'Keep it up' },
  ];

  create(comment: string, username: string) {
    const id = Date.now().toString();
    this.comments.push({ id, value: comment, username });
    return this.comments;
  }

  list() {
    return this.comments;
  }
}
