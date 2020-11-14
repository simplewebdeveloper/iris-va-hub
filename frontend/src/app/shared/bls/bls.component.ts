import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as uikit from 'uikit';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Bls } from 'src/app/models/bls.model';
import { ProjectService } from '../../project/project.service';

@Component({
  selector: 'app-bls',
  templateUrl: './bls.component.html',
  styleUrls: ['./bls.component.css']
})
export class BlsComponent implements OnInit {

  save_bls_form: FormGroup;
  bls_model = new Bls();
  bls_url: any;
  public success_user_message: string;
  public error_user_message: string;
  public show_user_message: false;

  constructor(
    private project_service: ProjectService,
    private form_builder: FormBuilder,
  ) { 
      this.bls_model = new Bls();
  }

  ngOnInit() {
    this.initialize_save_bls_form();
    this.get_current_bls_url();
  }

  initialize_save_bls_form(): void {
    this.save_bls_form = this.form_builder.group({
      id: this.bls_model.id,
      bls_url: this.bls_model.bls_url,
    })
  }

  save_bls_form_submit() {
    const data = this.save_bls_form.getRawValue();
    console.log(data)
    if(this.save_bls_form.valid) {

    this.project_service.save_bls(data).subscribe(
      (res) => {
        console.log(res);
        if(res) {
        this.bls_url = res.bls_url
        console.log(this.bls_url)
        this.success_user_message = 'Success saving bls config: ' + this.bls_url;
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

  
  get_current_bls_url() {
    this.project_service.get_current_bls_url().subscribe(
      (res) => {
        console.log(res);
        if(res) {
        this.bls_url = res.bls_url
        console.log(this.bls_url)
        this.success_user_message = 'Success getting bls url: ' + this.bls_url;
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



  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  notification_message(notification_message, status) {
    uikit.notification(notification_message, {pos: 'bottom-right', 'status': status});
  }

}
