// dump.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ViewInfoModalComponent } from '../view-info-modal/view-info-modal.component';

interface DumpRow {
  Dump_ID: number | null;
  Lead_Source_Code: string;
  Dumped_Date: string;
  Comments: string;
  editing?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-dump',
  templateUrl: './dump-sheet.component.html',
  styleUrls: ['./dump-sheet.component.css'],
  imports: [CommonModule, FormsModule, ViewInfoModalComponent],
  standalone: true
})
export class DumpSheetComponent implements OnInit {
  dumpSheetData: DumpRow[] = [];
  private apiUrl = 'http://localhost:3000/api/v1/dump';
  showViewInfoModal = false;
  selectedRow: any = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<DumpRow[]>(`${this.apiUrl}/display`).subscribe({
      next: (data: DumpRow[]) => {
        this.dumpSheetData = data.map(row => ({
          ...row,
          editing: false,
          Dumped_Date: row.Dumped_Date ? new Date(row.Dumped_Date).toISOString().slice(0, 16) : ''
        }));
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching data:', error);
      }
    });
  }

  addRow(): void {
    const newRow: DumpRow = {
      Dump_ID: null,
      Lead_Source_Code: '',
      Dumped_Date: new Date().toISOString().slice(0, 16),
      Comments: '',
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
        this.http.post<DumpRow>(`${this.apiUrl}`, this.cleanRowForSave(row)).subscribe({
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
      } else if (row.editing && row.Dump_ID) {
        this.http.put<DumpRow>(`${this.apiUrl}/${row.Dump_ID}`, this.cleanRowForSave(row)).subscribe({
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

  private cleanRowForSave(row: DumpRow): Partial<DumpRow> {
    const { editing, isNew, ...cleanedRow } = row;
    return cleanedRow;
  }

  cancelAdd(row: DumpRow): void {
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
        const exists = this.dumpSheetData.some((row: DumpRow) => row.Dump_ID === id);
        if (exists) {
          this.router.navigate(['/edit-dump', id]);
        } else {
          alert('Dump ID not found! Please enter a valid ID from the table.');
        }
      } else {
        alert('Invalid Dump ID. Please enter a number.');
      }
    }
  }

  updateRow(row: DumpRow): void {
    if (!row.Lead_Source_Code) {
      alert('Please fill in all required fields.');
      return;
    }
    const { editing, isNew, ...rowToUpdate } = row;
    if (row.Dump_ID) {
      this.http.put<DumpRow>(`${this.apiUrl}/${row.Dump_ID}`, rowToUpdate).subscribe({
        next: () => {
          alert('Entry updated successfully!');
          row.editing = false;
          this.fetchData();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating entry:', error);
          alert('Error updating entry. Please try again.');
        }
      });
    }
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
}
