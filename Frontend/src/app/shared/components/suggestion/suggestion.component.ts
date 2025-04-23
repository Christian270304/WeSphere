import { Component } from '@angular/core';
import { UserService } from '../../../core/services/user.service';

interface Suggestion {
  id: number;
  username: string;
  profileImage?: { url: string };
  isFollowing: boolean;
}

@Component({
  selector: 'app-suggestion',
  imports: [],
  templateUrl: './suggestion.component.html',
  styleUrl: './suggestion.component.scss'
})
export class SuggestionComponent {

  public suggestions: Suggestion[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.userService.getSuggestions().subscribe({
      next: (data) => {
        this.suggestions = data.sugerencias.map((suggestion: Suggestion) => ({
          ...suggestion,
          isFollowing: false
        }));
        console.log('Sugerencias:', this.suggestions); 
      },
      error: (err) => {
        console.error('Error al cargar sugerencias:', err);
      }
    });
  }

  toggleFollow(userId: number): void {
    this.userService.toggleFollow(userId).subscribe({
      next: (isFollowing) => {
        const suggestion = this.suggestions.find(s => s.id === userId);
        if (suggestion) {
          suggestion.isFollowing = isFollowing;
        }
      },
      error: (err) => {
        console.error('Error al seguir/dejar de seguir:', err);
      }
    });
  }
}
