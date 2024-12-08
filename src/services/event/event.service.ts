import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private eventSubject = new Subject<{ eventType: string}>();
  event$ = this.eventSubject.asObservable();

  constructor() {}

  emitEvent(eventType: string) {
    this.eventSubject.next({ eventType });
  }

}
