import { Component, OnInit } from '@angular/core';

// Import create service
import { ProjectService } from '../project.service';
import * as uikit from 'uikit';

import { FormBuilder, FormGroup } from '@angular/forms';
import { Project } from '../../models/project.model';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  create_project_form: FormGroup;
  project_model: Project;
  public success_user_message: string;
  public error_user_message: string;

  constructor(
    private project_service: ProjectService,
    private form_builder: FormBuilder,
  ) { 
    this.project_model = new Project();
  }

  ngOnInit() {
    this.initialize_create_project_form();
  }

  initialize_create_project_form(): void {
    this.create_project_form = this.form_builder.group({
      project_name: this.project_model.project_name,
      project_tag: this.project_model.project_tag,
      project_desc: this.project_model.project_desc,
    });
  }

  create_project_form_submit() {
    const data = this.create_project_form.getRawValue();
    console.log(data)
    if(this.create_project_form.valid) {

    this.project_service.create_project(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.success_user_message = 'Success creating project: ' + res.project_name ;
        this.toggle_user_message(this.success_user_message, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
      }
    );

  }

  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

}
