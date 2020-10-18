import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { ProjectService } from '../project.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../../models/project.model';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {

  edit_project_form: FormGroup;
  project_model = new Project();
  projects: any;
  project_id_from_url: number;
  project: any;
  public success_user_message: string;
  public error_user_message: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private project_service: ProjectService,
    private form_builder: FormBuilder,
  ) {
    this.project_model = new Project();
   }

  ngOnInit() {
    this.initialize_edit_project_form();
    this.get_projects();
    this.get_project_from_url();
  }

  initialize_edit_project_form(): void {
    this.edit_project_form = this.form_builder.group({
      project_id: this.project_model.id,
      project_name: this.project_model.project_name,
      project_tag: this.project_model.project_tag,
      project_desc: this.project_model.project_desc,
    });

  }

  get_projects() {
    this.project_service.get_all_projects().subscribe(
      (res) => {
        // console.log(res);
        this.projects = res;
        if (res.length > 0) {
        this.success_user_message = 'Success getting vas';
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

  get_project_from_url() {
    this.project = null;
    const project_id_from_url = +this.route.snapshot.paramMap.get('id');
    
    if(this.get_project_from_url) {
    this.project_service.add_project_id(project_id_from_url)
    this.project_service.get_single_project(project_id_from_url).subscribe(
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
      this.success_user_message = 'Success getting va: ' + project_name;
      this.toggle_user_message(this.success_user_message, 'success');
      }
  },
  (err: HttpErrorResponse) => {
      console.log(err);
      this.error_user_message = err.error;
      this.toggle_user_message(this.error_user_message, 'danger');
  }
    )
};
}

get_project_from_drop_down(event: any) {
  this.project = null;
  const project_id_from_drop_down = event.target.value;
  this.project_service.get_single_project(project_id_from_drop_down).subscribe(
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

edit_project_form_submit() {
  const data = this.edit_project_form.getRawValue();

  if(this.edit_project_form.valid) {
  this.project_service.save_project(data).subscribe(
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

toggle_user_message(notificationMessage, status) {
  uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
}

}
