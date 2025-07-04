import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

interface CallSheetRow {
  Recruitment_Data_ID: number | null;
  Parent_Name: string;
  Student_Name: string;
  Call_Date: string;
  Comments: string;
  Lead_Source_Code: string;
  EOD: string;
  Status: string;
  Contact: string;
}

@Component({
  selector: 'app-edit-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1>Edit Call Sheet Entry</h1>
      </div>
      <div class="card">
        <form (ngSubmit)="updateStudent()" #editForm="ngForm" class="form">
          <div class="form-group">
            <label>ID</label>
            <input type="text" class="form-control" [value]="row.Recruitment_Data_ID" readonly>
          </div>
          <div class="form-group">
            <label>Parent Name</label>
            <input type="text" class="form-control" [(ngModel)]="row.Parent_Name" name="Parent_Name" required>
          </div>
          <div class="form-group">
            <label>Student Name</label>
            <input type="text" class="form-control" [(ngModel)]="row.Student_Name" name="Student_Name" required>
          </div>
          <div class="form-group">
            <label>Contact Date</label>
            <input type="datetime-local" class="form-control" [(ngModel)]="row.Call_Date" name="Call_Date" required>
          </div>
          <div class="form-group">
            <label>Comments</label>
            <input type="text" class="form-control" [(ngModel)]="row.Comments" name="Comments">
          </div>
          <div class="form-group">
            <label>Lead Source</label>
            <input type="text" class="form-control" [(ngModel)]="row.Lead_Source_Code" name="Lead_Source_Code">
          </div>
          <div class="form-group">
            <label>Contact</label>
            <input type="text" class="form-control" [(ngModel)]="row.Contact" name="Contact" required>
          </div>
          <div class="form-group">
            <label>EOD</label>
            <select class="form-control" [(ngModel)]="row.EOD" name="EOD">
              <option *ngFor="let option of eodOptions" [value]="option.value">{{option.label}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select class="form-control" [(ngModel)]="row.Status" name="Status">
              <option *ngFor="let option of statusOptions" [value]="option.value" [ngClass]="option.class">{{option.label}}</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Update</button>
            <button type="button" class="btn btn-secondary" (click)="goBack()">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container { padding: 2rem; max-width: 700px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; text-align: center; }
    .card { background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.08); }
    .form { display: flex; flex-direction: column; gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-control { background: #fff; border: 1px solid #e0e0e0; border-radius: 6px; padding: 0.75rem; font-size: 1rem; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1rem; }
    .btn { padding: 0.75rem 1.5rem; border-radius: 6px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; }
    .btn-primary { background: #0066ff; color: #fff; }
    .btn-primary:hover { background: #0052cc; }
    .btn-secondary { background: #f0f7ff; color: #0066ff; }
    .btn-secondary:hover { background: #e5f0ff; }
    select.form-control option.status-not-interested { background: #ffe0c7; color: #a85b00; }
    select.form-control option.status-maybe { background: #fff3b0; color: #a68a00; }
    select.form-control option.status-interested { background: #1b7c4a; color: #fff; }
    select.form-control option.status-very-interested { background: #1e56a0; color: #fff; }
    select.form-control option.status-rna { background: #5c2676; color: #fff; }
    select.form-control option.status-contact-later { background: #e6d6f3; color: #7c3aed; }
  `]
})
export class EditCallsComponent implements OnInit {
  row: CallSheetRow = {
    Recruitment_Data_ID: null,
    Parent_Name: '',
    Student_Name: '',
    Call_Date: '',
    Comments: '',
    Lead_Source_Code: '',
    EOD: '',
    Status: '',
    Contact: ''
  };

  eodOptions = [
    { value: 'Keep - RNA', label: 'Keep - RNA' },
    { value: 'Move to call later', label: 'Move to call later' },
    { value: 'Move to dump', label: 'Move to dump' },
    { value: 'Keep - Nurture', label: 'Keep - Nurture' }
  ];

  statusOptions = [
    { value: 'Not Interested', label: 'Not Interested', class: 'status-not-interested' },
    { value: 'Maybe', label: 'Maybe', class: 'status-maybe' },
    { value: 'Interested', label: 'Interested', class: 'status-interested' },
    { value: 'Very Interested', label: 'Very Interested', class: 'status-very-interested' },
    { value: 'RNA', label: 'RNA', class: 'status-rna' },
    { value: 'Contact Later', label: 'Contact Later', class: 'status-contact-later' }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: { [key: string]: string }) => {
      const id = params['id'];
      if (id) {
        this.fetchRow(id);
      }
    });
  }

  fetchRow(id: string): void {
    this.http.get<CallSheetRow>(`https://backenddeployment-production-3dd5.up.railway.app/api/v1/s_pre_req/${id}`).subscribe({
      next: (data: CallSheetRow) => {
        this.row = data;
      },
      error: (error: HttpErrorResponse) => {
        alert('Error loading entry.');
        this.router.navigate(['/call-sheet']);
      }
    });
  }

  updateStudent(): void {
    this.http.put(`https://backenddeployment-production-3dd5.up.railway.app/api/v1/s_pre_req/${this.row.Recruitment_Data_ID}`, this.row).subscribe({
      next: () => {
        alert('Entry updated successfully!');
        this.router.navigate(['/call-sheet']);
      },
      error: (error: HttpErrorResponse) => {
        alert('Error updating entry.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/call-sheet']);
  }
} 