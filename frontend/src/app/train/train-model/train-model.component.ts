import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { TrainService } from '../train.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { VaService } from '../../va/va.service'

@Component({
  selector: 'app-train-model',
  templateUrl: './train-model.component.html',
  styleUrls: ['./train-model.component.css']
})
export class TrainModelComponent implements OnInit {
  private vas: any;
  private va: any;
  private va_id: any;
  private project_id: any;
  private intents: any;
  private update_intents: any;
  private selected_update_intent: string;
  private selected_va: any;
  private va_svps: any;
  private selected_intent: any;
  private string;
  private has_slots: boolean;
  private can_train_classifier_model: boolean;
  private can_train_update_sense_classifier_model: boolean;
  private can_train_svp_model: boolean;
  private train_progress: boolean;
  private train_completed: boolean;
  private intents_with_svp_data: any;

  public success_user_message: string;
  public error_user_message: string;

  constructor(
    private train_service: TrainService,
    private va_service: VaService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.get_va();
  }

  get_va() {
    this.va = null;

    this.va = this.va_service.get_current_va();
    this.va_id = this.va.id;

    this.va_svps = [];
    this.train_service.get_single_va(this.va_id).subscribe(
      (res) => {
        // console.log(res);
        this.selected_va = res;
        this.get_intents_with_svp_data(this.va_id);
        if(this.selected_va.va_slots == 'none') {
          this.has_slots = false;
          // console.log(this.has_slots);
        } else {
          this.has_slots = true;
        }
        this.string = this.selected_va.va_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.update_intents = this.intents.filter(s => s.includes('update'));
        const va_name = this.selected_va.va_name;
        if (res) {
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

  get_selected_intent(event: any) {
    this.selected_intent = event.target.value;
    if(this.has_slots == true) {
    this.va_svps = [];
    this.get_svps(this.va_id, this.selected_intent);
    }
  }

    get_svps(va_id: number, selected_intent: any) {
    this.train_service.get_all_svps(va_id, selected_intent).subscribe(
      (res) => {
        // console.log(res);
        this.va_svps = [];
        this.va_svps = res;
        if(res.length > 0) {
          this.success_user_message = 'Success getting svps';
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

  feed_intents(selected_intent: string) {
    this.train_completed = false;
    this.train_progress = false;
    if(selected_intent != 'none') {
      this.selected_update_intent = selected_intent;
    } else {
      this.selected_update_intent = 'none';
    }
    this.train_service.feed_intents(this.va_id, this.selected_update_intent).subscribe(
    (res) => {
      // console.log(res);
      if(res.length > 1) {
      this.success_user_message = 'Success feeding intents';
      this.toggle_user_message(this.success_user_message, 'success');
      this.can_train_classifier_model = true;
      }
      
    },
      (err: HttpErrorResponse) => {
      console.log(err);
      this.error_user_message = err.error;
      this.toggle_user_message(this.error_user_message, 'danger');
      }
      );
  }

  feed_update_sense() {
    this.train_completed = false;
    this.train_progress = false;
    this.train_service.feed_update_sense(this.va_id).subscribe(
    (res) => {
      // console.log(res);
      if(res.length > 1) {
      this.success_user_message = 'Success feeding Sense Data';
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

 feed_svps(selected_intent: string, va_tag) {
    this.train_completed = false;
    this.train_progress = false;
    // console.log(intentData);
    this.train_service.feed_svps(this.project_id, this.va_id, va_tag, selected_intent).subscribe(
     (res) => {
      //  console.log(res);
      if(res.length > 1) {
        this.success_user_message = 'Success feeding svps';
        this.toggle_user_message(this.success_user_message, 'success');
        this.can_train_svp_model = true;
      }
      
     },
     (err: HttpErrorResponse) => {
       console.log(err);
       this.error_user_message = err.error;
       this.toggle_user_message(this.error_user_message, 'danger');
     }
   );
  }

  train_classifier_model(selected_intent, va_tag) {
    this.show_training_status_model();
    this.train_service.train_classifier_model(this.va_id, selected_intent).subscribe(
      (res) => {
        // console.log(res);
        if(res.length > 1) {
          this.success_user_message = 'Success training classifier model';
          this.toggle_user_message(this.success_user_message, 'success');
          this.train_completed = true;
          this.train_progress = false;
        }
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
        this.hide_training_status_model();
      }
    );
  }

  train_update_sense_classifier_model() {
    this.can_train_update_sense_classifier_model = false;
    this.show_training_status_model();

    this.train_service.train_update_sense_classifier_model(this.va_id).subscribe(
      (res) => {
        // console.log(res);
        if(res.length > 1) {
          this.success_user_message = 'Success training update sense classifier model';
          this.toggle_user_message(this.success_user_message, 'success');
          this.train_completed = true;
          this.train_progress = false;
        }
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
        this.hide_training_status_model();
      }
    );

  }

    train_svp_model(selected_intent: string, va_tag) {
    this.can_train_svp_model = false;
    this.train_completed = false;
    this.train_progress = true;
    this.show_training_status_model();
    this.train_service.train_svp_model(selected_intent, this.project_id, this.va_id, va_tag).subscribe(
      (res) => {
        // console.log(res);
        if(res.length > 1) {
          this.success_user_message = 'Success training svp model';
          this.toggle_user_message(this.success_user_message, 'success');
          this.train_completed = true;
          this.train_progress = false;
        }
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
        this.hide_training_status_model();
      }
    );
  }

  get_intents_with_svp_data(va_id) {
    this.train_service.get_intents_with_svp_data(va_id).subscribe(
      (res) => {
        console.log(res);
          this.intents_with_svp_data = res;
          this.success_user_message = 'Success getting intents with svp data';
          this.toggle_user_message(this.success_user_message, 'success');
          this.train_completed = true;
          this.train_progress = false;
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
        this.hide_training_status_model();
      }
    );
  }

  // importJson(event, dom_element) {
  //   const file = event.target.files[0];
  //   let fileReader = new FileReader();
  //   fileReader.onload = (e) => {
  //     console.log(fileReader.result);
  //     this.elemRef.nativeElement.querySelectorAll(dom_element)[0].innerText = fileReader.result;
  //   }
  //   fileReader.readAsText(file);
  // }

  toggle_user_message(notification_message, status) {
    uikit.notification(notification_message, {pos: 'bottom-right', status: status});
  }

  show_training_status_model() {
    this.train_completed = false;
    this.train_progress = true;
    uikit.modal('#training_status_modal').show();
  }  

  hide_training_status_model() {
    uikit.modal('#training_status_modal').hide();
  }  
     
}