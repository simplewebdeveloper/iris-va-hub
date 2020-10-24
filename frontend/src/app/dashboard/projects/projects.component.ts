import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../../models/project.model';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  edit_project_form: FormGroup;
  create_project_form: FormGroup;
  project_model = new Project();
  private projects: any;
  project: any;
  public success_user_message: string;
  public error_user_message: string;
  public show_user_message = false;

  constructor(
    private dashboard_service: DashboardService,
    private form_builder: FormBuilder,
  ) { 
    this.project_model = new Project();
  }

  ngOnInit() {
    this.get_projects();
    this.initialize_edit_project_form();
    this.initialize_create_project_form();
  }

  initialize_edit_project_form(): void {
    this.edit_project_form = this.form_builder.group({
      project_id: this.project_model.id,
      project_name: this.project_model.project_name,
      project_tag: this.project_model.project_tag,
      project_desc: this.project_model.project_desc,
    });

  }

  initialize_create_project_form(): void {
    this.create_project_form = this.form_builder.group({
      project_name: this.project_model.project_name,
      project_tag: this.project_model.project_tag,
      project_desc: this.project_model.project_desc,
    });
  }

  edit_project_form_submit() {
    const data = this.edit_project_form.getRawValue();
  
    if(this.edit_project_form.valid) {
    this.dashboard_service.save_project(data).subscribe(
      (res) => {
        // console.log(res);
        const project_name = this.project.project_name;
        if(res) {
        this.success_user_message = 'Success updating project: ' + project_name;
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

  create_project_form_submit() {
    const data = this.create_project_form.getRawValue();
    console.log(data)
    if(this.create_project_form.valid) {

    this.dashboard_service.create_project(data).subscribe(
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



  get_projects() {
    this.dashboard_service.get_all_projects().subscribe(
      (res) => {
        console.log(res)
        this.projects = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  edit_project(project_id) {
  this.project = null;
  const project_id_to_edit = project_id
  this.dashboard_service.get_single_project(project_id_to_edit).subscribe(
  (res) => {
    // console.log(res);
    this.project = res;
    this.edit_project_form.patchValue({
      project_id: this.project.id,
      project_name: this.project.project_name,
      project_tag: this.project.project_tag,
      project_desc: this.project.project_desc,
    });
   
    const project_name = this.project.project_name;
    if (res.length > 1) {
    this.success_user_message = 'Success getting project: ' + project_name;
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

  delete_project(index, project_id, project_tag) {
      const sure = window.confirm('Are you sure ?')
      if(sure) {
        this.dashboard_service.delete_single_project(project_id).subscribe(
          (res) => {
            // console.log(res)
          const project_name = res.project_name
          this.success_user_message = 'Success deleting project: ' + project_name;
          this.notification_message(this.success_user_message, 'success');
          this.projects.splice(index, 1);
        },
      (err: HttpErrorResponse) => {
      console.log(err);
      this.error_user_message = err.error;
      this.notification_message(this.error_user_message, 'danger');
      }
    );

    }
  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  notification_message(notification_message, status) {
    uikit.notification(notification_message, {pos: 'bottom-right', 'status': status});
  }



}
