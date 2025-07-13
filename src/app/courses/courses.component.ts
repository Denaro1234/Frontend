import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ViewInfoModalComponent, CallSheetRow } from '../view-info-modal/view-info-modal.component';

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
  imports: [CommonModule, ViewInfoModalComponent],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  loading = false;
  error: string | null = null;
  showViewInfoModal = false;
  selectedRow: CallSheetRow | null = null;

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
    
    this.http.get<Course[]>('https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/display')
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
      this.http.patch(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/${id}`, { Class_Status: '0' }).subscribe({
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

  addRow(): void {
    const newRow: Course = {
      Course_ID: 0,
      Course_Name: '',
      Course_Description: '',
      Instructor_Head_ID: 0,
      Instructor_Lab_ID: 0,
      Clan: '',
    };
    this.courses.unshift(newRow);
  }

  showViewInfo(): void {
    const idString = prompt('Please enter the Course ID to view:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        this.http.get<any>(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/${id}`).subscribe({
          next: (data: any) => {
            this.selectedRow = {
              Recruitment_Data_ID: data.Course_ID,
              Parent_Name: data.Instructor_Head_ID ? 'Head: ' + data.Instructor_Head_ID : '',
              Student_Name: data.Course_Name,
              Call_Date: '',
              Comments: data.Course_Description || '',
              Lead_Source_Code: '',
              EOD: '',
              Status: data.Class_Status || '',
              Contact: data.Instructor_Lab_ID ? 'Lab: ' + data.Instructor_Lab_ID : '',
              Email: ''
            };
            this.showViewInfoModal = true;
          },
          error: (error: HttpErrorResponse) => {
            if (error.status === 404) {
              alert('Course ID not found!');
            } else {
              alert('Error fetching data. Please try again.');
            }
          }
        });
      } else {
        alert('Invalid Course ID. Please enter a number.');
      }
    }
  }

  closeViewInfoModal(): void {
    this.showViewInfoModal = false;
    this.selectedRow = null;
  }

  deleteEntry(): void {
    const idString = prompt('Please enter the Course ID to delete:');
    if (idString) {
      const id = parseInt(idString, 10);
      if (!isNaN(id)) {
        if (confirm('Are you sure you want to delete this entry?')) {
          this.http.patch(`https://backenddeployment-production-a4eb.up.railway.app/api/v1/courses/${id}`, { Class_Status: '0' }).subscribe({
            next: () => {
              alert('Course deleted successfully!');
              this.fetchData();
            },
            error: (error: HttpErrorResponse) => {
              console.error('Error deleting course:', error);
              alert('Error deleting course. Please try again.');
            }
          });
        }
      } else {
        alert('Invalid Course ID. Please enter a number.');
      }
    }
  }
} 