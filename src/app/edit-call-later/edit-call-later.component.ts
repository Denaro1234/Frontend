import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

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
}

@Component({
  selector: 'app-edit-call-later',
  templateUrl: './edit-call-later.component.html',
  styleUrls: ['./edit-call-later.component.css'],
  standalone: true,
  imports: [FormsModule]
})
export class EditCallLaterComponent implements OnInit {
  row: CallLaterRow = {
    Call_Later_Data_ID: null,
    Parent_Name: '',
    Student_Name: '',
    Contact: '',
    Email: '',
    Comments: '',
    Lead_Source_Code: '',
    Status: '',
    EOD: '',
    Call_Date: ''
  };
  private apiUrl = 'http://backenddeployment-production-3dd5.up.railway.app//api/v1/call-later';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.http.get<CallLaterRow>(`${this.apiUrl}/${id}`).subscribe({
        next: (data: CallLaterRow) => {
          this.row = data;
        },
        error: (error: HttpErrorResponse) => {
          alert('Error fetching data.');
        }
      });
    }
  }

  save(): void {
    if (this.row.Call_Later_Data_ID) {
      this.http.put(`${this.apiUrl}/${this.row.Call_Later_Data_ID}`, this.row).subscribe({
        next: () => {
          alert('Updated successfully!');
          this.router.navigate(['/call-later-sheet']);
        },
        error: () => {
          alert('Error updating entry.');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/call-later-sheet']);
  }
} 