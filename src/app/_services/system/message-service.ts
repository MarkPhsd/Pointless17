import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {

    private subject = new Subject<any>();
    private visible = new Subject<any>();

    sendMessage(message: string) {
      this.subject.next({ text: message });
    }

    clearMessages() {
        this.subject.next(null);
    }

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendVisible(isVisible: boolean) {
      this.visible.next( { boolean: isVisible })
    }

    getVisible():  Observable<any> {
      return this.visible.asObservable();
    }

    clearVisible() {
      this.subject.next(null);
  }

}
