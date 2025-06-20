import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewInfoModalComponent } from '../view-info-modal/view-info-modal.component';

interface CallLaterRow {
  Call_Later_Data_ID: number | null;
  Parent_Name: string;
  Student_Name: string;
  Contact: string;
  Email: string;
  Comments: string;
  Lead_Source_Code: string;
  Status: string;
  EOD: string;
  Call_Date: string;
  editing?: boolean;
  isNew?: boolean;
}

interface StatusOption {
  value: string;
  label: string;
  class: string;
}

@Component({
  selector: 'app-call-later-sheet',
  standalone: true,
  imports: [CommonModule, FormsModule, ViewInfoModalComponent],
  templateUrl: './call-later-sheet.component.html',
  styleUrls: ['./call-later-sheet.component.css']
})
export class CallLaterSheetComponent implements OnInit {
  callLaterData: CallLaterRow[] = [];
  private apiUrl = 'http://localhost:3000/api/v1/call-later';
  showViewInfoModal = false;
  selectedRow: any = null;

  eodOptions = [
    { value: 'Keep - RNA', label: 'Keep - RNA' },
    { value: 'Move to call later', label: 'Move to call later' },
    { value: 'Move to dump', label: 'Move to dump' },
    { value: 'Keep - Nurture', label: 'Keep - Nurture' }
  ];

  statusOptions: StatusOption[] = [
    { value: 'Not Interested', label: 'Not Interested', class: 'status-not-interested' },
    { value: 'Maybe', label: 'Maybe', class: 'status-maybe' },
    { value: 'Interested', label: 'Interested', class: 'status-interested' },
    { value: 'Very Interested', label: 'Very Interested', class: 'status-very-interested' },
    { value: 'RNA', label: 'RNA', class: 'status-rna' },
    { value: 'Contact Later', label: 'Contact Later', class: 'status-contact-later' }
  ];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  getActiveCount(): number {
    return this.callLaterData.filter((row: CallLaterRow) => row.Status === 'Active').length;
  }

  fetchData(): void {
    this.http.get<CallLaterRow[]>(`${this.apiUrl}/display`).subscribe({
      next: (data: CallLaterRow[]) => {
        console.log('Fetched data:', data);
        this.callLaterData = data.map((row: CallLaterRow) => ({
          ...row,
          editing: false,
          Call_Date: row.Call_Date ? new Date(row.Call_Date).toISOString().slice(0, 16) : ''
        }));
        console.log('Processed callLaterData:', this.callLaterData);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching data:', error);
        alert('Error fetching data. Please try again.');
      }
    });
  }

  addRow(): void {
    const newRow: CallLaterRow = {
      Call_Later_Data_ID: null,
      Parent_Name: '',
      Student_Name: '',
      Contact: '',
      Email: '',
      Comments: '',
      Lead_Source_Code: '',
      Status: '',
      EOD: '',
      Call_Date: new Date().toISOString().slice(0, 16),
      editing: true,
      isNew: true
    };
    this.callLaterData.unshift(newRow);
  }

  updateAllEditedRows(): void {
    const rowsToProcess = this.callLaterData.filter(row => row.isNew || row.editing);
    if (rowsToProcess.length === 0) {
      alert('No rows to update or save.');
      return;
    }
    let hasError = false;
    let processedCount = 0;
    rowsToProcess.forEach(row => {
      if (row.isNew) {
        this.http.post<CallLaterRow>(`${this.apiUrl}`, this.cleanRowForSave(row)).subscribe({
          next: () => {
            processedCount++;
            if (processedCount === rowsToProcess.length && !hasError) {
              alert('All new and edited rows processed successfully!');
              this.fetchData();
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error saving new row:', error);
            alert('Error saving new row.');
            hasError = true;
          }
        });
      } else if (row.editing && row.Call_Later_Data_ID) {
        this.http.put<CallLaterRow>(`${this.apiUrl}/${row.Call_Later_Data_ID}`, this.cleanRowForSave(row)).subscribe({
          next: () => {
            processedCount++;
            if (processedCount === rowsToProcess.length && !hasError) {
              alert('All new and edited rows processed successfully!');
              this.fetchData();
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error updating row:', error);
            alert('Error updating row.');
            hasError = true;
          }
        });
      }
    });
  }

  private cleanRowForSave(row: CallLaterRow): Partial<CallLaterRow> {
    const { editing, isNew, ...cleanedRow } = row;
    return cleanedRow;
  }

  cancelAdd(row: CallLaterRow): void {
    if (row.isNew) {
      this.callLaterData = this.callLaterData.filter(r => r !== row);
    } else if (row.editing) {
      row.editing = false;
      this.fetchData();
    }
  }

  editRow(index: number): void {
    this.callLaterData[index].editing = true;
  }

  deleteRow(id: number | null): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this entry?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          alert('Entry deleted successfully!');
          this.fetchData();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting entry:', error);
          alert('Error deleting entry. Please try again.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const found = this.statusOptions.find((opt: StatusOption) => opt.value === status);
    return found ? found.class : '';
  }

  showViewInfo(): void {
    const idString = prompt('Please enter the Call Later ID to view:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        this.http.get<CallLaterRow>(`${this.apiUrl}/${id}`).subscribe({
          next: (data: CallLaterRow) => {
            this.selectedRow = {
              Recruitment_Data_ID: data.Call_Later_Data_ID,
              Parent_Name: data.Parent_Name,
              Student_Name: data.Student_Name,
              Contact_Date: data.Call_Date,
              Comments: data.Comments,
              Lead_Source_Code: data.Lead_Source_Code,
              EOD: data.EOD,
              Status: data.Status,
              Contact: data.Contact,
              Email: data.Email,
            };
            this.showViewInfoModal = true;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error fetching data for view info:', error);
            if (error.status === 404) {
              alert('Call Later ID not found!');
            } else {
              alert('Error fetching data. Please try again.');
            }
          }
        });
      } else {
        alert('Invalid Call Later ID. Please enter a number.');
      }
    }
  }

  closeViewInfoModal(): void {
    this.showViewInfoModal = false;
    this.selectedRow = null;
  }

  navigateToEdit(): void {
    const idString = prompt('Please enter the Call Later ID:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        const exists = this.callLaterData.some((row: CallLaterRow) => row.Call_Later_Data_ID === id);
        if (exists) {
          this.router.navigate(['/edit-call-later', id]);
        } else {
          alert('Call Later ID not found! Please enter a valid ID from the table.');
        }
      } else {
        alert('Invalid Call Later ID. Please enter a number.');
      }
    }
  }
}
