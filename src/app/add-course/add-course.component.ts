import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface Course {
  Course_ID?: number;
  Course_Name: string;
  Course_Description?: string;
  Instructor_Head_ID?: number;
  Instructor_Lab_ID?: number;
  Clan: string;
  Duration: number;
  Delivery_Language: string;
  Flavour: string;
  Class_Status: string;
  Course_Fee?: number;
  Teacher_Guide?: string;
  Brochure_1?: string;
  Brochure_2?: string;
}

@Component({
  selector: 'app-add-course',
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule] // Removed ReactiveFormsModule unless explicitly needed
})
export class AddCourseComponent {
  course: Course = {
    Course_Name: '',
    Course_Description: '',
    Instructor_Head_ID: 0,
    Instructor_Lab_ID: 0,
    Clan: '',
    Duration: 0,
    Delivery_Language: '',
    Flavour: '',
    Class_Status: '1',
    Course_Fee: undefined,
    Teacher_Guide: '',
    Brochure_1: '',
    Brochure_2: ''
  };

  constructor(public router: Router, private http: HttpClient) {}

  onSubmit(): void {
    this.http.post('https://backenddeployment-production-3dd5.up.railway.app/api/v1/courses', this.course).subscribe({
      next: () => {
        alert('Course added successfully!');
        this.router.navigate(['/courses']);
      },
      error: (error: HttpErrorResponse) => {
        alert('Error adding course.');
        console.error(error);
      }
    });
  }
} 