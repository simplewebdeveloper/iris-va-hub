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
