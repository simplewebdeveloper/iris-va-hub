import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-vas',
  templateUrl: './vas.component.html',
  styleUrls: ['./vas.component.css']
})
export class VasComponent implements OnInit {

  private vas: any;
  public success_user_message: string;
  public error_user_message: string;
  public show_user_message = false;
  project_id: any;

  constructor(
    private route: ActivatedRoute,
    private project_service: ProjectService
  ) { }

  ngOnInit() {
    this.get_vas_for_project();
    this.get_project_id_from_url();
  }

  get_project_id_from_url() {
    this.project_id = null;
    this.project_id = +this.route.snapshot.paramMap.get('id');

}

  get_vas_for_project() {
    const project_id = +this.route.snapshot.paramMap.get('id');
    this.project_service.get_vas_for_project(project_id).subscribe(
      (res) => {
        this.vas = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }

  delete_va(index, va_id, va_tag) {
      const sure = window.confirm('Are you sure ?')
      if(sure) {
        this.project_service.delete_single_va(va_id, va_tag, this.project_id).subscribe(
          (res) => {
            // console.log(res)
          const va_name = res.va_name
          this.success_user_message = 'Success deleting va: ' + va_name;
          this.notification_message(this.success_user_message, 'success');
          this.vas.splice(index, 1);
        },
      (err: HttpErrorResponse) => {
      console.log(err);
      this.error_user_message = err.error;
      this.notification_message(this.error_user_message, 'danger');
      }
    );

    }
  }

  send_tag_and_id_to_project_service(va_id, va_tag) {
    // this.project_service.add_va_id(va_id);
    // this.project_service.add_va_tag(va_tag);
  }

  notification_message(notification_message, status) {
    uikit.notification(notification_message, {pos: 'bottom-right', 'status': status});
  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

}
