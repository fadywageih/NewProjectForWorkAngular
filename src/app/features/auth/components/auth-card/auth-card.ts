import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-card.html',
  styleUrls: ['./auth-card.css']
})
export class AuthCard {
  @Input() title: string = '';
  @Input() subtitle: string = '';
}