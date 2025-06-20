import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Student {
  Index_Number?: number;
  First_Name: string;
  Middle_Name?: string;
  Last_Name: string;
  Date_Of_Birth: string;
  Age?: number;
  Preference_Language: string;
  Email?: string;
  School?: string;
  Phone?: string;
  Whatsapp_Phone?: string;
  Start_Date?: string;
  End_Date?: string;
  Address: string;
  Status?: string;
  Created_On?: string;
  Created_By?: string;
  Updated_On?: string;
  Updated_By?: string;
  Social_Media_1?: string;
  Social_Media_2?: string;
  Social_Media_3?: string;
  Hobby_1?: string;
  Hobby_2?: string;
  Hobby_3?: string;
}

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: ['./add-student.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AddStudentComponent {
  student: Student = {
    First_Name: '',
    Middle_Name: '',
    Last_Name: '',
    Date_Of_Birth: '',
    Age: undefined,
    Preference_Language: '',
    Email: '',
    School: '',
    Phone: '',
    Whatsapp_Phone: '',
    Start_Date: '',
    End_Date: '',
    Address: '',
    Status: '1',
    Created_On: '',
    Created_By: '',
    Updated_On: '',
    Updated_By: '',
    Social_Media_1: '',
    Social_Media_2: '',
    Social_Media_3: '',
    Hobby_1: '',
    Hobby_2: '',
    Hobby_3: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  calculateAge(): void {
    if (this.student.Date_Of_Birth) {
      const today = new Date();
      const birthDate = new Date(this.student.Date_Of_Birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      this.student.Age = age;
    }
  }

  onSubmit(): void {
    this.http.post('http://localhost:3000/api/v1/students', this.student).subscribe({
      next: () => {
        alert('Student added successfully!');
        this.router.navigate(['/students']);
      },
      error: (error: HttpErrorResponse) => {
        alert('Error adding student.');
        console.error(error);
      }
    });
  }
} 