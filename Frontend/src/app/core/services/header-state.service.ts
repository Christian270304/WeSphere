import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HeaderStateService {
  private hideElementsSubject = new BehaviorSubject<boolean>(false);
  hideElements$ = this.hideElementsSubject.asObservable();
  
  setHideElements(value: boolean): void {
    this.hideElementsSubject.next(value);
  }
  
}
