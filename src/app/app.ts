import { Component } from '@angular/core';
import { signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet ,CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  title = 'NewProjectForWorkAngular';
  count = signal(0);
}