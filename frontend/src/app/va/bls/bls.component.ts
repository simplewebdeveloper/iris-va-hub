import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import * as uikit from 'uikit';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Bls } from 'src/app/models/bls.model';
import { ProjectService } from '../../project/project.service';
import { VaService } from '../../va/va.service';

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
    public project_service: ProjectService,
    public va_service: VaService,
    public form_builder: FormBuilder,
  ) { 
      this.bls_model = new Bls();
  }

  ngOnInit() {
    this.initialize_save_bls_form();
    this.get_bls();
  }

  initialize_save_bls_form(): void {
    this.save_bls_form = this.form_builder.group({
      id: this.bls_model.id,
      va: this.bls_model.va,
      bls_url: this.bls_model.bls_url,
    })
  }

  save_bls_form_submit() {
    const data = this.save_bls_form.getRawValue();
      // get current va
      const current_va_id = this.va_service.get_va_id();

      if(current_va_id) {
        this.save_bls_form.patchValue({
          va: current_va_id,
        });

        if(this.save_bls_form.valid) {

          this.va_service.save_bls(data).subscribe(
            (res) => {
              // console.log(res);
              if(res) {
              this.success_user_message = 'Success saving BL Server URL';
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

  }

  
  get_bls() {
    // get current va
    const current_va_id = this.va_service.get_va_id();
    console.log(current_va_id)

    if(current_va_id) {
    this.va_service.get_bls(current_va_id).subscribe(
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

  }



  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  notification_message(notification_message, status) {
    uikit.notification(notification_message, {pos: 'bottom-right', 'status': status});
  }

}
