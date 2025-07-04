import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Course {
  Course_ID: number;
  Course_Name: string;
  Course_Description: string;
  Instructor_Head_ID: number;
  Instructor_Lab_ID: number;
  Clan: string;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.loading = true;
    this.error = null;
    
    this.http.get<Course[]>('http://backenddeployment-production-3dd5.up.railway.app//api/v1/courses/display')
      .subscribe({
        next: (data: Course[]) => {
          console.log('Courses data received:', data);
          this.courses = data;
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching courses:', error);
          console.error('Full error object:', error);
          console.error('Error.error details:', error.error);
          this.error = `Failed to load courses. Status: ${error.status} - ${error.statusText}. Message: ${error.error?.message || 'No specific message.'}`;
          this.loading = false;
        }
      });
  }

  goToAddCourse(): void {
    this.router.navigate(['/add-course']);
  }

  goToEditCourse(courseId: number): void {
    this.router.navigate(['/edit-course', courseId]);
  }

  navigateToEditCourseById(): void {
    const id = prompt('Please enter the Course ID:');
    if (id) {
      const courseId = parseInt(id, 10);
      if (!isNaN(courseId)) {
        this.router.navigate(['/edit-course', courseId]);
      } else {
        alert('Invalid Course ID. Please enter a number.');
      }
    }
  }

  deleteCourse(id: number): void {
    if (confirm('Are you sure you want to delete this course?')) {
      this.http.patch(`http://backenddeployment-production-3dd5.up.railway.app//api/v1/courses/${id}`, { Class_Status: '0' }).subscribe({
        next: () => {
          alert('Course deleted successfully!');
          this.fetchData(); // Refresh the data after deletion
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error deleting course:', error);
          alert('Error deleting course. Please try again.');
        }
      });
    }
  }
} 