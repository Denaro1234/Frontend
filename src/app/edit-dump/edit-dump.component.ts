import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface DumpRow {
  Dump_ID: number | null;
  Lead_Source_Code: string;
  Dumped_Date: string;
  Comments: string;
}

@Component({
  selector: 'app-edit-dump',
  templateUrl: './edit-dump.component.html',
  styleUrls: ['./edit-dump.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class EditDumpComponent implements OnInit {
  row: DumpRow = {
    Dump_ID: null,
    Lead_Source_Code: '',
    Dumped_Date: '',
    Comments: ''
  };
  private apiUrl = 'http://localhost:3000/api/v1/dump';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<DumpRow>(`${this.apiUrl}/${id}`).subscribe({
        next: (data: DumpRow) => {
          this.row = data;
        },
        error: (error: HttpErrorResponse) => {
          alert('Error fetching data.');
        }
      });
    }
  }

  save(): void {
    if (this.row.Dump_ID) {
      this.http.put(`${this.apiUrl}/${this.row.Dump_ID}`, this.row).subscribe({
        next: () => {
          alert('Updated successfully!');
          this.router.navigate(['/dump-sheet']);
        },
        error: () => {
          alert('Error updating entry.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/dump-sheet']);
  }
} 