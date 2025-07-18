import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ViewInfoModalComponent, CallSheetRow } from '../view-info-modal/view-info-modal.component';

interface StudentDisplay {
  Index_Number: number | null;
  First_Name: string;
  Middle_Name?: string;
  Last_Name: string;
  Date_Of_Birth: string;
  Age: number;
  editing?: boolean;
  isNew?: boolean;
  Status?: string;
}

interface StudentInfo {
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
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
  imports: [CommonModule, FormsModule, ViewInfoModalComponent],
  standalone: true
})
export class StudentsComponent implements OnInit {
  studentsData: StudentDisplay[] = [];
  showViewInfoModal = false;
  selectedRow: StudentInfo | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<StudentDisplay[]>('https://backenddeployment-production-a4eb.up.railway.app/api/v1/students/display').subscribe({
      next: (data: StudentDisplay[]) => {
        this.studentsData = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading students data:', error);
      }
    });
  }

  addRow(): void {
    this.router.navigate(['/add-student']);
  }

  editRow(index: number): void {
    this.studentsData[index].editing = true;
  }

  cancelEdit(index: number): void {
    const student = this.studentsData[index];
    if (student.isNew) {
      this.studentsData.splice(index, 1);
    } else {
      student.editing = false;
    }
  }

  calculateAge(student: StudentDisplay): void {
    if (student.Date_Of_Birth) {
      const today = new Date();
      const birthDate = new Date(student.Date_Of_Birth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      student.Age = age;
    }
  }

  updateRow(student: StudentDisplay): void {
    if (!student.First_Name || !student.Last_Name || !student.Date_Of_Birth) {
      alert('Please fill in all required fields.');
      return;
    }
    this.calculateAge(student);
    const { editing, isNew, ...studentToUpdate } = student;
    if (student.isNew) {
      this.http.post('https://backenddeployment-production-a4eb.up.railway.app/api/v1/students', studentToUpdate).subscribe({
        next: () => {
          alert('Student added successfully!');
          this.fetchData();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error adding student:', error);
          alert('Error adding student. Please try again.');
        }
      });
    } else {
      this.http.put(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/students/${student.Index_Number}`, studentToUpdate).subscribe({
        next: () => {
          alert('Student updated successfully!');
          student.editing = false;
          this.fetchData();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error updating student:', error);
          alert('Error updating student. Please try again.');
        }
      });
    }
  }

  deleteRow(id: number | null): void {
    if (!id) return alert('Invalid ID');
    if (confirm('Are you sure you want to delete this entry?')) {
      this.http.patch(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/students/${id}`, { Updated_By: 'System' }).subscribe({
        next: () => {
          alert('Student deleted successfully!');
          this.fetchData();
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting student:', error);
          alert('Error deleting student. Please try again.');
        }
      });
    }
  }

  getActiveCount(): number {
    return this.studentsData.filter(student => student.Status === 'Active' || student.Status === '1').length;
  }

  navigateToEdit(): void {
    const id = prompt('Please enter the student ID:');
    if (id) {
      const exists = this.studentsData.some(student => student.Index_Number?.toString() === id);
      if (exists) {
        this.router.navigate(['/edit-student', id]);
      } else {
        alert('Student ID not found!');
      }
    }
  }

  goToAddStudent(): void {
    this.router.navigate(['/add-student']);
  }

  showViewInfo(): void {
    const idString = prompt('Please enter the student ID to view:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        this.http.get<any>(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/students/${id}`).subscribe({
          next: (data: any) => {
            this.selectedRow = {
              Index_Number: data.Index_Number,
              First_Name: data.First_Name,
              Middle_Name: data.Middle_Name,
              Last_Name: data.Last_Name,
              Date_Of_Birth: data.Date_Of_Birth,
              Age: data.Age,
              Preference_Language: data.Preference_Language,
              Email: data.Email,
              School: data.School,
              Phone: data.Phone,
              Whatsapp_Phone: data.Whatsapp_Phone,
              Start_Date: data.Start_Date,
              End_Date: data.End_Date,
              Address: data.Address,
              Status: data.Status,
              Created_On: data.Created_On,
              Created_By: data.Created_By,
              Updated_On: data.Updated_On,
              Updated_By: data.Updated_By,
              Social_Media_1: data.Social_Media_1,
              Social_Media_2: data.Social_Media_2,
              Social_Media_3: data.Social_Media_3,
              Hobby_1: data.Hobby_1,
              Hobby_2: data.Hobby_2,
              Hobby_3: data.Hobby_3
            };
            this.showViewInfoModal = true;
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 404) {
              alert('Student ID not found!');
            } else {
              alert('Error fetching data. Please try again.');
            }
          }
        });
      } else {
        alert('Invalid student ID. Please enter a number.');
      }
    }
  }

  closeViewInfoModal(): void {
    this.showViewInfoModal = false;
    this.selectedRow = null;
  }

  deleteEntry(): void {
    const idString = prompt('Please enter the student ID to delete:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        if (confirm('Are you sure you want to delete this entry?')) {
          this.http.patch(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/students/${id}`, { Updated_By: 'System' }).subscribe({
            next: () => {
              alert('Student deleted successfully!');
              this.fetchData();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error deleting student:', error);
              alert('Error deleting student. Please try again.');
            }
          });
        }
      } else {
        alert('Invalid student ID. Please enter a number.');
      }
    }
  }
} 