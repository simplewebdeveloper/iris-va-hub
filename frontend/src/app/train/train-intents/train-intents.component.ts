import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TrainService } from '../train.service';
import { VaService } from '../../va/va.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Intent } from '../../models/intent.model';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-train-intents',
  templateUrl: './train-intents.component.html',
  styleUrls: ['./train-intents.component.css']
})
export class TrainIntentsComponent implements OnInit {
  @ViewChild('intentInput', { static: false }) intentInput: ElementRef;

  create_intent_form: FormGroup;
  intent_model = new Intent();
  public vas: any;
  public va: any;
  public intents: any;
  public selected_intent: any;
  public string;
  public intents_and_utterances: any;
  public va_id: any;
  public intent_data_temp;
  public success_user_message: string;
  public error_user_message: string;
  public textFile: any;

  constructor(
    public train_service: TrainService,
    public va_service: VaService,
    public form_builder: FormBuilder,
    public route: ActivatedRoute,
  ) {
    this.intent_model = new Intent();
  }

  ngOnInit() {
    this.get_va();
    this.initialize_create_intent_form();
  }

  initialize_create_intent_form(): void {
    this.create_intent_form = this.form_builder.group({
      va_id: [this.intent_model.va_id, Validators.required],
      intent: [this.intent_model.intent, Validators.required],
      utterance: [this.intent_model.utterance, Validators.required],
      intent_data: [this.intent_model.intent, Validators.required]
    });
  }

  create_intent_form_submit() {
    if(this.textFile) {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let lines = fileReader.result;
        let array = (<string>lines).split('\n');
        array.forEach(line => {
          const data = this.create_intent_form.getRawValue();
          data.intent = this.selected_intent;
          data.utterance = line;
          data.intent_data = '{' + '"intent":' + '"' + data.intent + '"' + ',' + '"utterance":' + '"' + data.utterance + '"' + '}';
          this.train_service.create_intent(data).subscribe(
            (res) => {
              console.log(res);
              if(res) {
              this.intents_and_utterances.unshift(res);
              this.success_user_message = 'Success creating intent';
              this.toggle_user_message(this.success_user_message, 'success') 
                this.textFile = '';
              }
            },
            (err: HttpErrorResponse) => {
              console.log(err);
              this.error_user_message = err.error;
              this.toggle_user_message(this.error_user_message, 'danger');
            }
          );
        });
      }
      fileReader.readAsText(this.textFile);

    } else {

    const data = this.create_intent_form.getRawValue();
    data.intent = this.selected_intent;
    data.intent_data = '{' + '"intent":' + '"' + data.intent + '"' + ',' + '"utterance":' + '"' + data.utterance + '"' + '}';
    // console.log(data.intent_data);
    this.train_service.create_intent(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.intents_and_utterances.unshift(res);
        this.success_user_message = 'Success creating intent';
        this.toggle_user_message(this.success_user_message, 'success')
        // select the text
        this.selectInputText();
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

  get_va() {
    this.va = null;
    this.va = this.va_service.get_current_va();
    this.va_id = this.va.id;
    this.va_service.get_single_va(this.va_id).subscribe(
      (res) => {
        console.log(res);
        this.va = res;
        this.string = this.va.va_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.create_intent_form.patchValue({
          va_id: this.va.id,
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

  get_selected_intent(event:any) {
    this.selected_intent = event.target.value;
    // console.log(this.selected_intent);
    // console.log(this.va.id)
    this.get_intents(this.va.id, this.selected_intent);
    
    
  }

  get_intents(va_id: number, selected_intent: any) {
    this.train_service.get_all_intents(va_id, selected_intent).subscribe(
      (res) => {
        this.intents_and_utterances = [];
        this.intents_and_utterances = res;
        if(res.length > 0) {
        this.success_user_message = 'Success getting intents';
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

  delete_intent(intent_id, i) {
    this.train_service.delete_single_utterance(intent_id).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.intents_and_utterances.splice(i, 1);
        this.success_user_message = 'Success deleting intent';
        this.toggle_user_message(this.success_user_message, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        this.error_user_message = err.error;
        this.toggle_user_message(this.error_user_message, 'danger');
      }
    );
  }

  toggle_user_message(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  selectInputText() {
    <HTMLInputElement>this.intentInput.nativeElement.select();
  }

  upload_file(event) {
    this.textFile = event.target.files[0];
  }

}
