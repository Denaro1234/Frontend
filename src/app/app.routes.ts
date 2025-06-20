import { Routes } from '@angular/router';
// import { EditStudentComponent } from './edit-student/edit-student.component';
import { CallSheetComponent } from './call-sheet/call-sheet.component';
import { CallLaterSheetComponent } from './call-later-sheet/call-later-sheet.component';
import { DumpSheetComponent } from './dump-sheet/dump-sheet.component';
import { StudentsComponent } from './students/students.component';
import { AddStudentComponent } from './add-student/add-student.component';
import { CoursesComponent } from './courses/courses.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { EditCourseComponent } from './edit-course/edit-course.component';
import { EditCallsComponent } from './edit-calls/edit-calls.component';
import { EditCallLaterComponent } from './edit-call-later/edit-call-later.component';
import { EditDumpComponent } from './edit-dump/edit-dump.component';

export const routes: Routes = [
    {path: 'call-sheet', title: 'Call Sheet', component: CallSheetComponent},
    {path: 'call-later-sheet', title: 'Call Later Sheet', component: CallLaterSheetComponent},
    {path: 'dump-sheet', title: 'Dump Sheet', component: DumpSheetComponent},
    {path: 'students', title: 'Students', component: StudentsComponent},
    {path: 'add-student', component: AddStudentComponent},
    {path: 'edit-calls/:id', component: EditCallsComponent},
    {path: 'edit-call-later/:id', component: EditCallLaterComponent},
    {path: 'edit-dump/:id', component: EditDumpComponent},
    {path: 'courses', title: 'Courses', component: CoursesComponent},
    {path: 'add-course', component: AddCourseComponent},
    {path: 'edit-course/:id', component: EditCourseComponent},
    {path: '', redirectTo: '/call-sheet', pathMatch: 'full'}
];
