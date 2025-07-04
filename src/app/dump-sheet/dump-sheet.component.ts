// dump.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewInfoModalComponent, CallSheetRow } from '../view-info-modal/view-info-modal.component';

interface DumpSheetRow {
  Dump_ID: number | null;
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
  selector: 'app-dump-sheet',
  templateUrl: './dump-sheet.component.html',
  styleUrls: ['./dump-sheet.component.css'],
  imports: [CommonModule, FormsModule, ViewInfoModalComponent],
  standalone: true
})
export class DumpSheetComponent implements OnInit {
  dumpSheetData: DumpSheetRow[] = [];
  private apiUrl = 'http://backenddeployment-production-3dd5.up.railway.app//api/v1/dump';
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

  fetchData(): void {
    this.http.get<DumpSheetRow[]>(`${this.apiUrl}/display`).subscribe({
      next: (data: DumpSheetRow[]) => {
        this.dumpSheetData = data.map(row => ({
          ...row,
          editing: false,
          Call_Date: row.Call_Date ? new Date(row.Call_Date).toISOString().slice(0, 16) : ''
        }));
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  addRow(): void {
    const newRow: DumpSheetRow = {
      Dump_ID: null,
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
    this.dumpSheetData.unshift(newRow);
  }

  updateAllEditedRows(): void {
    const rowsToProcess = this.dumpSheetData.filter(row => row.isNew || row.editing);
    if (rowsToProcess.length === 0) {
      alert('No rows to update or save.');
      return;
    }

    let hasError = false;
    let processedCount = 0;

    rowsToProcess.forEach(row => {
      if (row.isNew) {
        if (!row.Dump_ID) {
          alert('Please provide a Dump ID for new entries.');
          hasError = true;
          return;
        }
        this.http.post<DumpSheetRow>(`${this.apiUrl}`, this.cleanRowForSave(row)).subscribe({
          next: () => {
            processedCount++;
            if (processedCount === rowsToProcess.length && !hasError) {
              alert('All new and edited rows processed successfully!');
              this.fetchData();
            }
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error saving new row:', error);
            alert(`Error saving new row for ID ${row.Dump_ID}. Please ensure the ID is unique and all required fields are filled if your database schema dictates them.`);
            hasError = true;
          }
        });
      } else if (row.editing) {
        if (row.Dump_ID) {
          this.http.put<DumpSheetRow>(`${this.apiUrl}/${row.Dump_ID}`, this.cleanRowForSave(row)).subscribe({
            next: () => {
              processedCount++;
              if (processedCount === rowsToProcess.length && !hasError) {
                alert('All new and edited rows processed successfully!');
                this.fetchData();
              }
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error updating row:', error);
              alert(`Error updating row for ID ${row.Dump_ID}. Please try again.`);
              hasError = true;
            }
          });
        }
      }
    });
  }

  private cleanRowForSave(row: DumpSheetRow): Partial<DumpSheetRow> {
    const { editing, isNew, ...cleanedRow } = row;
    return cleanedRow;
  }

  saveNewRow(row: DumpSheetRow): void {
    if (!row.Parent_Name || !row.Student_Name) {
      alert('Please fill in all required fields.');
      return;
    }
    const { editing, isNew, ...rowToSave } = row;
    this.http.post<DumpSheetRow>(`${this.apiUrl}`, rowToSave).subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        console.error('Error saving new row:', error);
      }
    });
  }

  cancelAdd(row: DumpSheetRow): void {
    if (row.isNew) {
      this.dumpSheetData = this.dumpSheetData.filter(r => r !== row);
    } else if (row.editing) {
      row.editing = false;
      this.fetchData();
    }
  }

  editRow(index: number): void {
    this.dumpSheetData[index].editing = true;
  }

  navigateToEdit(): void {
    const idString = prompt('Please enter the Dump ID:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        const exists = this.dumpSheetData.some((row: DumpSheetRow) => row.Dump_ID === id);
        if (exists) {
          this.router.navigate(['/edit-dump', id]);
        } else {
          alert('Dump ID not found! Please enter a valid Dump ID from the table.');
        }
      } else {
        alert('Invalid Dump ID. Please enter a number.');
      }
    }
  }

  updateRow(row: DumpSheetRow): void {
    if (!row.Parent_Name || !row.Student_Name) {
      alert('Please fill in all required fields.');
      return;
    }
    const { editing, isNew, ...rowToUpdate } = row;
    this.http.put<DumpSheetRow>(`${this.apiUrl}/${row.Dump_ID}`, rowToUpdate).subscribe({
      next: () => {},
      error: (error: HttpErrorResponse) => {
        console.error('Error updating row:', error);
      }
    });
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
    const idString = prompt('Please enter the Dump ID to view:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        this.http.get<DumpSheetRow>(`${this.apiUrl}/${id}`).subscribe({
          next: (data: DumpSheetRow) => {
            this.selectedRow = { ...data, Recruitment_Data_ID: data.Dump_ID } as CallSheetRow;
            this.showViewInfoModal = true;
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 404) {
              alert('Dump ID not found!');
            } else {
              alert('Error fetching data. Please try again.');
            }
          }
        });
      } else {
        alert('Invalid Dump ID. Please enter a number.');
      }
    }
  }

  closeViewInfoModal(): void {
    this.showViewInfoModal = false;
    this.selectedRow = null;
  }

  deleteEntry(): void {
    const idString = prompt('Please enter the Dump ID to delete:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        const exists = this.dumpSheetData.some((row: DumpSheetRow) => row.Dump_ID === id);
        if (exists) {
          this.deleteRow(id);
        } else {
          alert('Dump ID not found! Please enter a valid Dump ID from the table.');
        }
      } else {
        alert('Invalid Dump ID. Please enter a number.');
      }
    }
  }
}
