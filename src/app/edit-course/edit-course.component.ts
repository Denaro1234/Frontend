import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule]
})
export class EditCourseComponent implements OnInit {
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
  courseId: number | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: { [key: string]: string }) => {
      this.courseId = +params['id'];
      if (this.courseId) {
        this.fetchCourseData(this.courseId);
      }
    });
  }

  fetchCourseData(id: number): void {
    this.http.get<Course>(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/${id}`).subscribe({
      next: (data: Course) => {
        this.course = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error fetching course data:', error);
        alert('Failed to load course data.');
        this.router.navigate(['/courses']);
      }
    });
  }

  onSubmit(): void {
    if (this.courseId) {
      this.http.put(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/${this.courseId}`, this.course).subscribe({
        next: () => {
          alert('Course updated successfully!');
          this.router.navigate(['/courses']);
        },
        error: (error: HttpErrorResponse) => {
          alert('Error updating course.');
          console.error(error);
        }
      });
    }
  }

  deleteCourse(): void {
    if (confirm('Are you sure you want to delete this course?')) {
      if (this.courseId) {
        // Assuming a soft delete (PATCH) similar to students
        this.http.patch(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/${this.courseId}`, { Class_Status: '0' }).subscribe({
          next: () => {
            alert('Course soft-deleted successfully!');
            this.router.navigate(['/courses']);
          },
          error: (error: HttpErrorResponse) => {
            alert('Error soft-deleting course.');
            console.error(error);
          }
        });
      }
    }
  }

  cancelEdit(): void {
    this.router.navigate(['/courses']);
  }
} 