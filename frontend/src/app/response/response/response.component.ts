import { Component, OnInit } from '@angular/core';
import { ResponseService } from '../response.service'
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Response } from '../../models/response.model';
import { VaService } from '../../va/va.service';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.css'],
  providers: [ResponseService]
})
export class ResponseComponent implements OnInit {

  private va: any;
  public va_id: any;
  private string;
  create_response_form: FormGroup;
  edit_response_form: FormGroup;
  response_model = new Response();
  private responses: any;
  response: any;
  public success_user_message: string;
  public error_user_message: string;
  public show_user_message: false;
  private intents: any;

  jinja_response: string;

  constructor(
    private response_service: ResponseService,
    private va_service: VaService,
    private form_builder: FormBuilder,
  ) { 
    this.response_model = new Response();
   }

  ngOnInit() {
    // this.get_response();
    this.get_va();
    this.get_responses('default', this.va_id);
    this.initialize_edit_response_form();
    this.initialize_create_response_form();
    
  }

  // get current va

  get_va() {
    this.va = null;
    this.va = this.va_service.get_current_va();
    this.va_id = this.va.id;
    this.va_service.get_single_va(this.va_id).subscribe(
      (res) => {
        // console.log(res);
        this.va = res;
        this.string = this.va.va_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.create_response_form.patchValue({
          va: this.va.id,
        });
        const va_name = this.va.va_name
        if(res.length > 0) {
          this.success_user_message = 'Success getting va: ' + va_name;
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


  // handles device switching
  switch_device(device: string) {
    this.create_response_form.patchValue({
      device: device,
    });
    this.get_responses(device, this.va_id);
  }

  // get all intents
    // should be able to parse va

  initialize_create_response_form(): void {
    this.create_response_form = this.form_builder.group({
      va: this.response_model.va,
      device: this.response_model.device,
      intent: this.response_model.intent,
      template: this.response_model.template,
    })
    this.create_response_form.patchValue({
      device: 'desktop',
    });
  }

  initialize_edit_response_form(): void {
    this.edit_response_form = this.form_builder.group({
      id: this.response_model.id,
      va: this.response_model.va,
      device: this.response_model.device,
      intent: this.response_model.intent,
      template: this.response_model.template,
    })
  }


  create_response_form_submit() {
    const data = this.create_response_form.getRawValue();
    // console.log(data)
    if(this.create_response_form.valid) {

    this.response_service.create_response(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.success_user_message = 'Success creating response';
        this.toggle_user_message(this.success_user_message, 'success');
        this.get_responses(data['device'], this.va_id);
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


  edit_response_form_submit() {
    const data = this.edit_response_form.getRawValue();
    // console.log(data);
    if(this.edit_response_form.valid) {
    this.response_service.save_response(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.success_user_message = 'Success updating response';
        this.toggle_user_message(this.success_user_message, 'success');
        this.get_responses(data['device'], this.va_id);
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

  get_responses(device: string, va_id: any) {
    this.response_service.get_responses(device, va_id).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.responses = res;
        this.success_user_message = 'Success getting responses';
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

  delete_response(response_id: number) {
    // console.log(response_id)
    const confirmed = window.confirm('Are you sure?');

    if(confirmed) {
    this.response_service.delete_responses(response_id).subscribe(
      
      (res) => {
        // console.log(res);
        if(res) {
        this.success_user_message = 'Success deleting responses';
        this.toggle_user_message(this.success_user_message, 'success');
        }
        this.get_responses('desktop', this.va_id)
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


  populate_edit_resp_form(response: any) {
      this.edit_response_form.patchValue({
        id: response.id,
        va: response.va,
        device: response.device,
        intent: response.intent,
        template: response.template,
      })
  }


}
