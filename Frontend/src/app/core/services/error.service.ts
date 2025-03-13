import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' }) 

export class ErrorService {
  private errorMessage = new BehaviorSubject<string | null>(null);
  error$ = this.errorMessage.asObservable();

  setError(message: string) {
    this.errorMessage.next(message);
    setTimeout(() => this.clearError(), 5000); 
  }

  clearError() {
    this.errorMessage.next(null);
  }
}
