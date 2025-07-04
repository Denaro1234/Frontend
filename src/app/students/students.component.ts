import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css'],
  imports: [CommonModule, FormsModule],
  standalone: true
})
export class StudentsComponent implements OnInit {
  studentsData: StudentDisplay[] = [];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.http.get<StudentDisplay[]>('http://backenddeployment-production-3dd5.up.railway.app/api/v1/students/display').subscribe({
      next: (data: StudentDisplay[]) => {
        this.studentsData = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading students data:', error);
      }
    });
  }

  addRow(): void {
    const newRow: StudentDisplay = {
      Index_Number: null,
      First_Name: '',
      Middle_Name: '',
      Last_Name: '',
      Date_Of_Birth: new Date().toISOString().slice(0, 10),
      Age: 0,
      editing: true,
      isNew: true
    };
    this.studentsData.unshift(newRow);
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
      this.http.post('http://backenddeployment-production-3dd5.up.railway.app/api/v1/students', studentToUpdate).subscribe({
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
      this.http.put(`http://backenddeployment-production-3dd5.up.railway.app/api/v1/students/${student.Index_Number}`, studentToUpdate).subscribe({
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
      this.http.patch(`http://backenddeployment-production-3dd5.up.railway.app/api/v1/students/${id}`, { Updated_By: 'System' }).subscribe({
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
} 