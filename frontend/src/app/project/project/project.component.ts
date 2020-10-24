import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from '../project.service';

import { HttpErrorResponse } from '@angular/common/http';
import * as uikit from 'uikit';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {

  project: any;
  public success_user_message: string;
  public error_user_message: string;

  constructor(
    private route: ActivatedRoute,
    private project_service: ProjectService,
  ) { }

  ngOnInit() {
    this.get_project_from_url();
  }


  get_project_from_url() {
    this.project = null;
    const project_id_from_url = +this.route.snapshot.paramMap.get('id');
    // console.log(project_id_from_url)
    
    this.project_service.get_single_project(project_id_from_url).subscribe(
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

toggle_user_message(notificationMessage, status) {
  uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
}

}
