import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VaService } from '../va.service';

import { HttpErrorResponse } from '@angular/common/http';
import * as uikit from 'uikit';

@Component({
  selector: 'app-va',
  templateUrl: './va.component.html',
  styleUrls: ['./va.component.css']
})
export class VaComponent implements OnInit {

  va: any;
  public success_user_message: string;
  public error_user_message: string;

  constructor(
    public route: ActivatedRoute,
    public va_service: VaService,
  ) { }

  ngOnInit() {
    this.get_va_from_url();
  }

  get_va_from_url() {
    this.va = null;
    const va_id_from_url = +this.route.snapshot.paramMap.get('id');
    // console.log(project_id_from_url)
    
    this.va_service.get_single_va(va_id_from_url).subscribe(
    (res) => {
      // console.log(res);
      this.va = res;
      this.va_service.set_current_va(this.va);
      // this.va_service.set_project_id(this.va.project);
     
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


toggle_user_message(notificationMessage, status) {
  uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
}

}
