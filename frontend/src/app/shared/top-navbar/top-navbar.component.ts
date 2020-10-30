import { Component, OnInit } from '@angular/core';
import { AuthService } from "../../auth/auth.service";
import { ActivatedRoute } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as uikit from 'uikit';
import { EditService } from '../../edit/edit.service';
import { DashboardService } from '../../dashboard/dashboard.service';
import { VaService } from '../../va/va.service';


@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent implements OnInit {
  public loggedIn: boolean;
  projects: any;
  project_id: any;
  va_id: any;  

  constructor(
    private edit_service: EditService,
    private dashboard_service: DashboardService,
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
    
  }

  get_last_five_projects() {
    this.dashboard_service.get_last_five_projects().subscribe(
      (res) => {
        console.log(res, 'logged from to nav bar comp')
        this.projects = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  navigate_to_edit() {
    this.project_id = this.va_service.get_project_id();
    this.va_id = this.va_service.get_va_id();
    this.router.navigate(['/edit', {va_id: this.va_id, project_id: this.project_id}]);
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







}
