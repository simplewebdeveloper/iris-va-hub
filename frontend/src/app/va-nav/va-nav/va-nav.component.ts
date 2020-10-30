import { Component, OnInit } from '@angular/core';
import { EditService } from '../../edit/edit.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-va-nav',
  templateUrl: './va-nav.component.html',
  styleUrls: ['./va-nav.component.css']
})
export class VaNavComponent implements OnInit {

  project_id: any;
  va_id: any;  
  constructor(
    private edit_service: EditService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  navigate_to_edit() {
    this.project_id = this.edit_service.get_project_id();
    this.va_id = this.edit_service.get_va_id();
    this.router.navigate(['/edit', {va_id: this.va_id, project_id: this.project_id}]);
  }

  navigate_to_intents() {
    this.project_id = this.edit_service.get_project_id();
    this.va_id = this.edit_service.get_va_id();
    this.router.navigate(['/intents', {va_id: this.va_id, project_id: this.project_id}]);
  }
  
  navigate_to_svps() {
    this.project_id = this.edit_service.get_project_id();
    this.va_id = this.edit_service.get_va_id();
    this.router.navigate(['/svps', {va_id: this.va_id, project_id: this.project_id}]);
  }

  navigate_to_train() {
    this.project_id = this.edit_service.get_project_id();
    this.va_id = this.edit_service.get_va_id();
    this.router.navigate(['/train', {va_id: this.va_id, project_id: this.project_id}]);
  }

  navigate_to_test() {
    this.project_id = this.edit_service.get_project_id();
    this.va_id = this.edit_service.get_va_id();
    this.router.navigate(['/test', {va_id: this.va_id, project_id: this.project_id}]);
  }

}
