import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CallSheetRow {
  Recruitment_Data_ID: number | null;
  Parent_Name: string;
  Student_Name: string;
  Call_Date: string;
  Comments: string;
  Lead_Source_Code: string;
  EOD: string;
  Status: string;
  Contact: string;
  Email: string;
}

@Component({
  selector: 'app-view-info-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Information</h2>
          <button class="close-button" (click)="onClose()">&times;</button>
        </div>
        <div class="modal-body">
          <div class="info-grid">
            <ng-container *ngFor="let key of getKeys(data)">
              <div class="info-item">
                <label>{{ toLabel(key) }}</label>
                <div>{{ data[key] }}</div>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
      padding: 20px;
      border-bottom: 1px solid #eee;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      line-height: 1;
    }

    .close-button:hover {
      color: #333;
    }

    .modal-body {
      padding: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .info-item label {
      font-weight: 600;
      color: #666;
      font-size: 0.9rem;
    }

    .info-item div {
      color: #333;
      font-size: 1rem;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 4px;
    }
  `]
})
export class ViewInfoModalComponent {
  @Input() data!: any;
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  toLabel(key: string): string {
    // Convert snake_case or camelCase to Title Case with spaces
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
} 