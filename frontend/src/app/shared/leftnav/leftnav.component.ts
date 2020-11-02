import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnChanges, OnInit} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from "../../auth/auth.service";
import { VaService } from '../../va/va.service';
import { ProjectService } from '../../project/project.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Project } from '../../models/project.model';

import * as uikit from 'uikit';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.css']
})
export class LeftnavComponent implements OnInit {
  edit_project_form: FormGroup;
  project_model = new Project();
  public success_user_message: string;
  public error_user_message: string;
  private currentPath = ""
  show_va_menu: boolean;
  show_project_menu: boolean;
  project_id: any;
  project: any;
  va_id: any;
  va: any;

  constructor(
    private router: Router, 
    private project_service: ProjectService,
    private va_service: VaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private form_builder: FormBuilder
    ) { 
  }

  ngOnInit() {
    this.initialize_edit_project_form();

  this.checks();
    
  }


  logout() {
    this.authService.logout();
  }

  checks() {

    setInterval(()=>{                           
      this.check_for_va();
      this.check_for_project();
    }, 1000);
  
}

initialize_edit_project_form(): void {
  this.edit_project_form = this.form_builder.group({
    project_id: this.project_model.id,
    project_name: this.project_model.project_name,
    project_tag: this.project_model.project_tag,
    project_desc: this.project_model.project_desc,
  });

}


edit_project(project_id) {
  this.project = null;
  const project_id_to_edit = project_id
  this.project_service.get_single_project(project_id_to_edit).subscribe(
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



check_for_va() {
  // check if va service contains a va
  this.va = this.va_service.get_current_va();
 if(this.va) {
   this.show_va_menu = true;
 } else {
   this.show_va_menu = false;
 }
}

check_for_project() {
  // check if project service contains a project
  this.project = this.project_service.get_current_project();
 if(this.project) {
  
   this.show_project_menu = true;
 } else {
   this.show_project_menu = false;
 }

};

toggle_user_message(notificationMessage, status) {
  uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
}


}
