import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../project.service';
import { VaService } from '../../va/va.service'
import * as uikit from 'uikit';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Transition } from '../../models/transition.model';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material';

@Component({
  selector: 'app-transition',
  templateUrl: './transition.component.html',
  styleUrls: ['./transition.component.css']
})
export class TransitionComponent implements OnInit {
  create_transition_form: FormGroup;
  transition_model: Transition;
  vas: any;
  va: any;
  handoff_vas: any;
  source_va_intents: any;
  project: any;
  vas_for_project: any;
  transitions_for_project: any;
  public transitions: any;
  public success_user_message: string;
  public error_user_message: string;

  constructor(
    private project_service: ProjectService,
    private va_service: VaService,
    private form_builder: FormBuilder,
  ) { 
    this.transition_model = new Transition();
   }

  ngOnInit() {
    this.get_current_project();
    this.get_handoff_vas_for_the_current_project();
    this.initialize_create_transition_form();
    this.get_vas_for_project();
    this.get_transitions_for_project();
  }


  initialize_create_transition_form(): void {
    this.create_transition_form = this.form_builder.group({
    transition_name: this.transition_model.transition_name,
    project: this.transition_model.project,
    source_va_id: this.transition_model.source_va_id,
    source_va_name: this.transition_model.source_va_name,
    source_va_intent: this.transition_model.source_va_intent,
    dest_va: this.transition_model.dest_va,
    });
    if(this.project) {
      this.create_transition_form.patchValue({
        project: this.project.id,
      })
    }
  }

  create_transition_form_submit() {
    const data = this.create_transition_form.getRawValue();

    data.source_va_name = this.va.va_name;

    console.log(data)

    if(this.create_transition_form.valid) {

      this.project_service.create_transition(data).subscribe(
        
        (res) => {
          // console.log(res);
          if(res) {
          this.transitions.unshift(res);
          this.success_user_message = 'Success creating transition';
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

  get_current_project() {
    this.project = this.project_service.get_current_project();
  }

  get_transitions_for_project() {
    const project_id = this.project.id;
    this.project_service.get_transitions_for_project(project_id).subscribe(
      (res) => {
        console.log(res);
        this.transitions = [];
        this.transitions = res;
        if(res) {
        this.transitions_for_project = res;
        this.success_user_message = 'Success getting transitions for project';
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

  delete_transition(transition_id, i) {
    this.project_service.delete_single_transition(transition_id).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.transitions.splice(i, 1);
        this.success_user_message = 'Success deleting transition';
        this.toggle_user_message(this.success_user_message, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
      }
    );
  }

  get_vas_for_project() {
      const project_id = this.project.id;
      this.project_service.get_vas_for_project(project_id).subscribe(
        (res) => {
          // console.log(res);
          if(res) {
          this.vas_for_project = res;
          this.success_user_message = 'Success getting vas for project';
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

  get_handoff_vas_for_the_current_project() {
    const va_tag = 'handoff'; 
    this.project_service.get_vas_for_project_by_tag(this.project.id, va_tag).subscribe(
      (res) => {
        console.log(res);
        this.handoff_vas = res;
        this.success_user_message = 'Success getting handoff vas';
        this.toggle_user_message(this.success_user_message, 'success');
      
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
      }
    );
  }

  get_intents_for_selected_va(event: any) {
    const va_id = event.target.value
    this.va_service.get_single_va(va_id).subscribe(
      (res) => {
        console.log(res);
        this.va = res;
        if(this.va) {
          this.create_transition_form.patchValue({
            source_va_id: this.va.id,
            // source_va_name: this.va.va_name,
          })
        }
        const string = this.va.va_intents.replace(/\s/g, '');
        this.source_va_intents = string.split(',');
        console.log(this.source_va_intents);
        const va_name = this.va.va_name;
        this.success_user_message = 'Success getting va: ' + va_name;
        this.toggle_user_message(this.success_user_message, 'success');
      
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


}
