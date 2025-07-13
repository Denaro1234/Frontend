import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewInfoModalComponent } from '../view-info-modal/view-info-modal.component';

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
  Email: string;
  editing?: boolean;
  isNew?: boolean;
}

interface StatusOption {
  value: string;
  label: string;
  class: string;
}

@Component({
  selector: 'app-call-sheet',
  templateUrl: './call-sheet.component.html',
  styleUrls: ['./call-sheet.component.css'],
  imports: [CommonModule, FormsModule, ViewInfoModalComponent],
  standalone: true
})
export class CallSheetComponent implements OnInit {
  callSheetData: CallSheetRow[] = [];
  private apiUrl = 'https://backenddeployment-production-a4eb.up.railway.app/api/v1/s_pre_req';
  showViewInfoModal = false;
  selectedRow: CallSheetRow | null = null;

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
    return this.callSheetData.filter(row => row.Status === 'Active').length;
  }

  fetchData(): void {
    this.http.get<CallSheetRow[]>(`${this.apiUrl}/display`).subscribe({
      next: (data: CallSheetRow[]) => {
        console.log('Fetched data:', data);
        this.callSheetData = data.map(row => {
          console.log('Processing row:', row);
          return {
            ...row,
            editing: false,
            Call_Date: row.Call_Date ? new Date(row.Call_Date).toISOString().slice(0, 16) : ''
          };
        });
        console.log('Processed callSheetData:', this.callSheetData);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  addRow(): void {
    const newRow: CallSheetRow = {
      Recruitment_Data_ID: null,
      Parent_Name: '',
      Student_Name: '',
      Call_Date: new Date().toISOString().slice(0, 16),
      Comments: '',
      Lead_Source_Code: '',
      EOD: this.eodOptions[0].value,
      Status: this.statusOptions[0].value,
      Contact: '',
      Email: '',
      editing: true,
      isNew: true
    };
    this.callSheetData.unshift(newRow);
  }

  updateAllEditedRows(): void {
    const rowsToProcess = this.callSheetData.filter(row => row.isNew || row.editing);
    if (rowsToProcess.length === 0) {
      alert('No rows to update or save.');
      return;
    }

    let hasError = false;
    let processedCount = 0;

    rowsToProcess.forEach(row => {
      // Removed specific validation for Parent_Name and Student_Name here.
      // Backend now handles required fields logic (only Recruitment_Data_ID).

      if (row.isNew) {
        // Validate Recruitment_Data_ID for new rows before sending
        if (!row.Recruitment_Data_ID) {
          alert('Please provide a Recruitment ID for new entries.');
          hasError = true;
          return;
        }

        this.http.post<CallSheetRow>(`${this.apiUrl}`, this.cleanRowForSave(row)).subscribe({
          next: () => {
            processedCount++;
            if (processedCount === rowsToProcess.length && !hasError) {
              alert('All new and edited rows processed successfully!');
              this.fetchData();
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error saving new row:', error);
            alert(`Error saving new row for ID ${row.Recruitment_Data_ID}. Please ensure the ID is unique and all required fields are filled if your database schema dictates them.`);
            hasError = true;
          }
        });
      } else if (row.editing) {
        // Existing rows only update if Recruitment_Data_ID exists
        if (row.Recruitment_Data_ID) {
          this.http.put<CallSheetRow>(`${this.apiUrl}/${row.Recruitment_Data_ID}`, this.cleanRowForSave(row)).subscribe({
            next: () => {
              processedCount++;
              if (processedCount === rowsToProcess.length && !hasError) {
                alert('All new and edited rows processed successfully!');
                this.fetchData();
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error updating row:', error);
              alert(`Error updating row for ID ${row.Recruitment_Data_ID}. Please try again.`);
              hasError = true;
            }
          });
        }
      }
    });
  }

  // Helper function to remove transient properties before sending to API
  private cleanRowForSave(row: CallSheetRow): Partial<CallSheetRow> {
    const { editing, isNew, ...cleanedRow } = row;
    return cleanedRow;
  }

  saveNewRow(row: CallSheetRow): void {
    // This function is now primarily called by updateAllEditedRows, or potentially left for individual row saves
    // Existing logic should be fine, but consider if this specific endpoint should still be accessible directly
    if (!row.Parent_Name || !row.Student_Name) {
      alert('Please fill in all required fields.');
      return;
    }

    const { editing, isNew, ...rowToSave } = row;

    this.http.post<CallSheetRow>(`${this.apiUrl}`, rowToSave).subscribe({
      next: () => {
        // No need to fetch data immediately, as updateAllEditedRows will do it once all are processed
        // You might want to update the UI to reflect success for this single row here if not fetching all
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error saving new row:', error);
        // Error handled by updateAllEditedRows for collective feedback
      }
    });
  }

  cancelAdd(row: CallSheetRow): void {
    // If the row is new and not yet saved, filter it out.
    // If it's an existing row that was being edited, just revert its editing state.
    if (row.isNew) {
      this.callSheetData = this.callSheetData.filter(r => r !== row);
    } else if (row.editing) {
      row.editing = false;
      // Optionally, revert specific fields if you have original values stored or re-fetch for this row
      this.fetchData(); // Re-fetch to revert changes for this specific row
    }
  }

  editRow(index: number): void {
    this.callSheetData[index].editing = true;
  }

  navigateToEdit(): void {
    const idString = prompt('Please enter the Recruitment ID:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        const exists = this.callSheetData.some((row: CallSheetRow) => row.Recruitment_Data_ID === id);
        if (exists) {
          this.router.navigate(['/edit-calls', id]);
        } else {
          alert('Recruitment ID not found! Please enter a valid Recruitment ID from the table.');
        }
      } else {
        alert('Invalid Recruitment ID. Please enter a number.');
      }
    }
  }

  updateRow(row: CallSheetRow): void {
    if (!row.Parent_Name || !row.Student_Name) {
      alert('Please fill in all required fields.');
      return;
    }

    const { editing, isNew, ...rowToUpdate } = row;

    if (row.EOD === 'Move to dump') {
      this.http.post<CallSheetRow>('https://backenddeployment-production-a4eb.up.railway.app/api/v1/dump', rowToUpdate).subscribe({
        next: () => {
          this.http.delete(`${this.apiUrl}/${row.Recruitment_Data_ID}`).subscribe({
            next: () => {
              alert('Moved to dump successfully!');
              this.fetchData();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error removing from call sheet:', error);
              alert('Error removing from call sheet.');
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error moving to dump:', error);
          alert('Error moving to dump.');
        }
      });
      return;
    }

    if (row.EOD === 'Move to call later') {
      this.http.post<CallSheetRow>('https://backenddeployment-production-a4eb.up.railway.app/api/v1/call-later', rowToUpdate).subscribe({
        next: () => {
          this.http.delete(`${this.apiUrl}/${row.Recruitment_Data_ID}`).subscribe({
            next: () => {
              alert('Moved to call later successfully!');
              this.fetchData();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error removing from call sheet:', error);
              alert('Error removing from call sheet.');
            }
          });
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error moving to call later:', error);
          alert('Error moving to call later.');
        }
      });
      return;
    }

    if (row.Recruitment_Data_ID) {
      this.http.put<CallSheetRow>(`${this.apiUrl}/${row.Recruitment_Data_ID}`, rowToUpdate).subscribe({
        next: () => {
          // Success handled by updateAllEditedRows for collective feedback and fetching
          // row.editing = false; // This is now handled by updateAllEditedRows
          // this.fetchData(); // This is now handled by updateAllEditedRows
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating row:', error);
          // Error handled by updateAllEditedRows for collective feedback
        }
      });
    } else {
      // This else block is no longer needed as saveNewRow is called by updateAllEditedRows
      // this.saveNewRow(row);
    }
  }

  deleteRow(id: number | null): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this entry?')) {
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          this.fetchData();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting row:', error);
          alert('Error deleting data. Please try again.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const found = this.statusOptions.find((opt: StatusOption) => opt.value === status);
    return found ? found.class : '';
  }

  showViewInfo(): void {
    const idString = prompt('Please enter the Recruitment ID to view:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        this.http.get<CallSheetRow>(`${this.apiUrl}/${id}`).subscribe({
          next: (data: CallSheetRow) => {
            this.selectedRow = data;
            this.showViewInfoModal = true;
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error fetching data for view info:', error);
            if (error.status === 404) {
              alert('Recruitment ID not found!');
            } else {
              alert('Error fetching data. Please try again.');
            }
          }
        });
      } else {
        alert('Invalid Recruitment ID. Please enter a number.');
      }
    }
  }

  closeViewInfoModal(): void {
    this.showViewInfoModal = false;
    this.selectedRow = null;
  }

  deleteEntry(): void {
    const idString = prompt('Please enter the Recruitment ID to delete:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        const exists = this.callSheetData.some((row: CallSheetRow) => row.Recruitment_Data_ID === id);
        if (exists) {
          this.deleteRow(id);
        } else {
          alert('Recruitment ID not found! Please enter a valid Recruitment ID from the table.');
        }
      } else {
        alert('Invalid Recruitment ID. Please enter a number.');
      }
    }
  }

  moveToCallLater(): void {
    const idString = prompt('Enter the Recruitment ID to move to Call Later:');
    if (!idString) return;
    const id = parseInt(idString, 10);
    if (isNaN(id)) {
      alert('Invalid Recruitment ID. Please enter a number.');
      return;
    }
    this.http.post(`${this.apiUrl}/move1/${id}`, {}).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          alert('Moved to Call Later successfully!');
          this.fetchData();
        } else {
          alert(res && res.message ? res.message : 'Failed to move to Call Later.');
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          alert('Recruitment ID not found!');
        } else {
          alert('Error moving to Call Later.');
        }
      }
    });
  }

  moveToDump(): void {
    const idString = prompt('Enter the Recruitment ID to move to Dump:');
    if (!idString) return;
    const id = parseInt(idString, 10);
    if (isNaN(id)) {
      alert('Invalid Recruitment ID. Please enter a number.');
      return;
    }
    this.http.post(`${this.apiUrl}/move2/${id}`, {}).subscribe({
      next: () => {
        alert('Moved to Dump successfully!');
        this.fetchData();
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          alert('Recruitment ID not found!');
        } else {
          alert('Error moving to Dump.');
        }
      }
    });
  }
}
