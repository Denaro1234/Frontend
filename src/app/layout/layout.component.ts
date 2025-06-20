import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="top-navbar">
      <a routerLink="/call-sheet" routerLinkActive="active" title="Call Sheet"><i class="fas fa-phone"></i></a>
      <a routerLink="/call-later-sheet" routerLinkActive="active" title="Call Later"><i class="fas fa-clock"></i></a>
      <a routerLink="/dump-sheet" routerLinkActive="active" title="Dump Sheet"><i class="fas fa-trash-alt"></i></a>
      <a routerLink="/students" routerLinkActive="active" title="Students"><i class="fas fa-table"></i></a>
      <a routerLink="/courses" routerLinkActive="active" title="Courses"><i class="fas fa-book"></i></a>
    </nav>
    <div class="main-content">
      <div class="content-wrapper">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .top-navbar {
      display: flex;
      align-items: center;
      background: #1e293b;
      padding: 0.5rem 2rem;
      gap: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .top-navbar a {
      color: #94a3b8;
      text-decoration: none;
      font-size: 1.5rem;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      display: flex;
      align-items: center;
      position: relative;
      transition: background 0.2s, color 0.2s;
    }
    .top-navbar a.active, .top-navbar a:hover {
      color: #fff;
      background: #334155;
    }
    .top-navbar a[title]:hover::after {
      content: attr(title);
      position: absolute;
      left: 50%;
      bottom: -2.2em;
      transform: translateX(-50%);
      background: #222;
      color: #fff;
      padding: 4px 10px;
      border-radius: 4px;
      white-space: nowrap;
      font-size: 0.9rem;
      pointer-events: none;
      opacity: 1;
      z-index: 10;
    }
    .main-content {
      flex: 1;
      background: #f8f9fa;
      min-height: 100vh;
      padding: 0;
      display: flex;
      flex-direction: column;
    }
    .content-wrapper {
      flex: 1;
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }
  `],
})
export class LayoutComponent {} 