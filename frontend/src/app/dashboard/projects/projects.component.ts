import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../dashboard.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  private projects: any;
  public success_user_message: string;
  public error_user_message: string;
  public show_user_message = false;

  constructor(
    private dashboard_service: DashboardService
  ) { }

  ngOnInit() {
    this.get_projects();
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

  notification_message(notification_message, status) {
    uikit.notification(notification_message, {pos: 'bottom-right', 'status': status});
  }

}
