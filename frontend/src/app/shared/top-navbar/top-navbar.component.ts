import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth/auth.service";
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as uikit from 'uikit';
import { EditService } from '../../edit/edit.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { VaService } from '../../va/va.service';
import { ProjectService } from '../../project/project.service'


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements OnInit {
  public loggedIn: boolean;
  projects: any;
  project_id: any;
  project_name: any;
  project: any;
  va_id: any;
  va_name: any;
  va: any;

  constructor(
    private edit_service: EditService,
    private dashboard_service: DashboardService,
    private project_service: ProjectService,
    private va_service: VaService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    ) { }

  ngOnInit() {

    this.get_last_five_projects();
    
  }

  ngOnDestroy() {
    
  }

  ngDoCheck(): void {
    //Called every time that the input properties of a component or a directive are checked. Use it to extend change detection by performing a custom check.
    //Add 'implements DoCheck' to the class.
    if(this.authService.isLoggedIn()) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }

    this.get_current_project_and_va();
    
  }

  get_last_five_projects() {
    this.dashboard_service.get_last_five_projects().subscribe(
      (res) => {
        // console.log(res)
        this.projects = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  get_current_project_and_va() {

    this.va = this.va_service.get_current_va();
    this.project = this.project_service.get_current_project();

    if(this.va && this.project) {
      this.project_id = this.project.id
    this.project_name = this.project.project_name
    this.va_id = this.va.id
    this.va_name = this.va.va_name
    }
    
  }

check() {
  setInterval(()=>{                           
    this.get_current_project_and_va();
  }, 1000);
}




}
