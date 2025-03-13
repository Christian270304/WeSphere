import { Component } from '@angular/core';
import { ErrorService } from '../../../core/services/error.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-message',
  imports: [CommonModule],
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss'
})
export class ErrorMessageComponent {
  constructor(public errorService: ErrorService) {}
}
