import { Component } from '@angular/core';

@Component({
  selector: 'app-call-sheet',
  templateUrl: './call-sheet.component.html',
  styleUrls: ['./call-sheet.component.css']
})
export class CallSheetComponent {
  // Initial data for the table
  callSheetData = [
    {
      parentName: 'John Doe',
      studentName: 'Jane Doe',
      phoneNumber: '123-456-7890',
      source: 'Web',
      comments: 'Interested',
      status: 'Follow Up',
      action: 'Call Again',
      callDate: '2024-08-01'
    },
    {
      parentName: 'Alice Smith',
      studentName: 'Bob Smith',
      phoneNumber: '987-654-3210',
      source: 'Referral',
      comments: 'Promising',
      status: 'Scheduled',
      action: 'Send Info',
      callDate: '2024-08-05'
    }
  ];

  // Method to add a new row
  addRow() {
    this.callSheetData.push({
      parentName: '',
      studentName: '',
      phoneNumber: '',
      source: '',
      comments: '',
      status: '',
      action: '',
      callDate: ''
    });
  }
}
