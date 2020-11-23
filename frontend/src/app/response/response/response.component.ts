import { Component, OnInit } from '@angular/core';
import { ResponseService } from '../response.service'
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Response } from '../../models/response.model';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.css'],
  providers: [ResponseService]
})
export class ResponseComponent implements OnInit {

  create_response_form: FormGroup;
  edit_response_form: FormGroup;
  response_model = new Response();
  private responses: any;
  response: any;
  public success_user_message: string;
  public error_user_message: string;
  public show_user_message: false;

  jinja_response: string;

  constructor(
    private response_service: ResponseService,
    private form_builder: FormBuilder,
  ) { 
    this.response_model = new Response();
   }

  ngOnInit() {
    // this.get_response();
    this.initialize_edit_response_form();
    this.initialize_create_response_form();

    this.jinja_response = `
    {% if not can_create_collections %}
    {% if can_create_collections %}
    {% if can_create_collections %}
    `
  }

  initialize_create_response_form(): void {
    this.create_response_form = this.form_builder.group({
      project: this.response_model.project,
      va: this.response_model.va,
      intent: this.response_model.intent,
      name: this.response_model.name,
      description: this.response_model.description,
      template: this.response_model.template,
    })
  }

  initialize_edit_response_form(): void {
    this.edit_response_form = this.form_builder.group({
      id: this.response_model.id,
      project: this.response_model.project,
      va: this.response_model.va,
      intent: this.response_model.intent,
      name: this.response_model.name,
      description: this.response_model.description,
      template: this.response_model.template,
    })
  }


  create_response_form_submit() {
    const data = this.create_response_form.getRawValue();
    console.log(data)
    if(this.create_response_form.valid) {

    this.response_service.create_response(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.success_user_message = 'Success creating project: ' + res.name ;
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


  edit_response_form_submit() {
    const data = this.edit_response_form.getRawValue();
    console.log(data);
    if(this.edit_response_form.valid) {
    this.response_service.save_response(data).subscribe(
      (res) => {
        // console.log(res);
        const response_name = this.response.name;
        if(res) {
        this.success_user_message = 'Success updating response: ' + response_name;
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
