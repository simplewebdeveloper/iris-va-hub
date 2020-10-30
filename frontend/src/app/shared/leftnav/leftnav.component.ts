import { AfterContentChecked, AfterViewChecked, AfterViewInit, Component, OnChanges, OnInit} from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from "../../auth/auth.service";
import { VaService } from '../../va/va.service';
import { ProjectService } from '../../project/project.service';

import * as uikit from 'uikit';

@Component({
  selector: 'app-leftnav',
  templateUrl: './leftnav.component.html',
  styleUrls: ['./leftnav.component.css']
})
export class LeftnavComponent implements OnInit {
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
    ) { 
  }

  ngOnInit() {
    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          this.currentPath = this.router.url;
          // this.currentPath = this.currentPath.replace('/', '');
          this.currentPath = this.currentPath.replace(/[0-9]/g, '');
          this.currentPath = this.currentPath.replace(/\\|\//g,'');

        }
      }
    );

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

check_for_va() {
  // check if va service contains a va
  const va = this.va_service.get_va_id();
 if(va) {
   this.show_va_menu = true;
 } else {
   this.show_va_menu = false;
 }
}

get_current_va(va_id) {
    this.va_service.get_single_va(va_id).subscribe(
      (res) => {
        console.log(res, 'here is the name');
        this.va = res;
       
        const va_name = this.va.va_name;
        if (res.length > 0) {
        this.success_user_message = 'Success getting va: ' + va_name;
        this.toggle_user_message(this.success_user_message, 'success');
        }
    },
    (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
    }
      )
   
}

check_for_project() {
  // check if va service contains a va
  const project_id = this.project_service.get_project_id();
 if(project_id) {
   this.show_project_menu = true;
   this.get_current_project(project_id);
 } else {
   this.show_project_menu = false;
 }

}

 get_current_project(project_id) {
  this.project_service.get_single_project(project_id).subscribe(
    (res) => {
      // console.log(res);
      this.project = res;
     
      const project_name = this.project.project_name;
      if (res.length > 0) {
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
 }



// Navigation functions

navigate_to_va() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/va',this.va_id]);
}

navigate_to_intents() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/intents', {va_id: this.va_id, project_id: this.project_id}]);
}

navigate_to_svps() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/svps', {va_id: this.va_id, project_id: this.project_id}]);
}

navigate_to_train() {
  this.project_id = this.va_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/train', {va_id: this.va_id, project_id: this.project_id}]);
}

navigate_to_test() {
  this.project_id = this.project_service.get_project_id();
  this.va_id = this.va_service.get_va_id();
  this.router.navigate(['/test', {va_id: this.va_id, project_id: this.project_id}]);
}

toggle_user_message(notificationMessage, status) {
  uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
}


}
