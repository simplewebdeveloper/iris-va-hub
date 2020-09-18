import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {TrainService} from '../train.service';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Intent } from '../../models/intent.model';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-train-intents',
  templateUrl: './train-intents.component.html',
  styleUrls: ['./train-intents.component.css']
})
export class TrainIntentsComponent implements OnInit {
  @ViewChild('intentInput', {static: false}) intentInput: ElementRef;

  createIntentForm: FormGroup;
  intentModel = new Intent();
  private bots: any;
  private bot: any;
  private intents: any;
  private selectedIntent: any;
  private string;
  private intentsAndUtterances: any;
  public botId: any;
  private intentDataTemp;
  public successUserMessage: string;
  public errorUserMessage: string;
  public textFile: any;

  constructor(
    private trainService: TrainService,
    private formBuilder: FormBuilder
  ) {
    this.intentModel = new Intent();
  }

  ngOnInit() {
    this.getBots();
    this.initializeCreateIntentForm();
  }

  initializeCreateIntentForm(): void {
    this.createIntentForm = this.formBuilder.group({
      bot_id: [this.intentModel.botId, Validators.required],
      intent: [this.intentModel.intent, Validators.required],
      utterance: [this.intentModel.utterance, Validators.required],
      intent_data: [this.intentModel.intentData, Validators.required]
    });
  }

  createIntentFormSubmit() {
    if(this.textFile) {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let lines = fileReader.result;
        let array = (<string>lines).split('\n');
        array.forEach(line => {
          const data = this.createIntentForm.getRawValue();
          data.intent = this.selectedIntent;
          data.utterance = line;
          data.intent_data = '{' + '"intent":' + '"' + data.intent + '"' + ',' + '"utterance":' + '"' + data.utterance + '"' + '}';
          this.trainService.createIntent(data).subscribe(
            (res) => {
              // console.log(res);
              if(res) {
              this.intentsAndUtterances.unshift(res);
              this.successUserMessage = 'Success creating intent';
              this.toggleUserMessage(this.successUserMessage, 'success') 
                this.textFile = '';
              }
            },
            (err: HttpErrorResponse) => {
              console.log(err);
              this.errorUserMessage = err.error;
              this.toggleUserMessage(this.errorUserMessage, 'danger');
            }
          );
        });
      }
      fileReader.readAsText(this.textFile);

    } else {

    const data = this.createIntentForm.getRawValue();
    data.intent = this.selectedIntent;
    data.intent_data = '{' + '"intent":' + '"' + data.intent + '"' + ',' + '"utterance":' + '"' + data.utterance + '"' + '}';
    // console.log(data.intent_data);
    this.trainService.createIntent(data).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.intentsAndUtterances.unshift(res);
        this.successUserMessage = 'Success creating intent';
        this.toggleUserMessage(this.successUserMessage, 'success')
        // select the text
        this.selectInputText();
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
      }
    );
  }
}

  getBots() {
    this.trainService.getAllBots().subscribe(
      (res) => {
        // console.log(res);
        this.bots = res;
        if(res.length > 0) {
        this.successUserMessage = 'Success getting bots';
        this.toggleUserMessage(this.successUserMessage, 'success');
        }
        
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
      }
    );
  }

  getBot(event: any) {
    const botId = +event.target.value;
    this.botId = botId;
    this.trainService.getSingleBot(botId).subscribe(
      (res) => {
        // console.log(res);
        this.bot = res;
        this.string = this.bot.bot_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.createIntentForm.patchValue({
          bot_id: this.bot.id,
        });
        this.botId = botId;
        const botName = this.bot.bot_name
        if(res.length > 0) {
          this.successUserMessage = 'Success getting bot: ' + botName;
          this.toggleUserMessage(this.successUserMessage, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
      }
    );
  }

  getSelectedIntent(event:any) {
    this.selectedIntent = event.target.value;
    // console.log(this.selectedIntent);
    this.getIntents(this.botId, this.selectedIntent);
    
  }

  getIntents(botId: number, selectedIntent: any) {
    this.trainService.getAllIntents(botId, selectedIntent).subscribe(
      (res) => {
        // console.log(res);
        this.intentsAndUtterances = [];
        this.intentsAndUtterances = res;
        if(res.length > 0) {
        this.successUserMessage = 'Success getting intents';
        this.toggleUserMessage(this.successUserMessage, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
    }
    );
  }
  deleteUtterance(intentId, i) {
    this.trainService.deleteSingleUtterance(intentId).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.intentsAndUtterances.splice(i, 1);
        this.successUserMessage = 'Success deleting intent';
        this.toggleUserMessage(this.successUserMessage, 'success');
        }
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
      }
    );
  }

  toggleUserMessage(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  // Select text inside a div
  // selectText(id){
  //   var sel, range;
  //   var el = document.getElementById(id); //get element id
  //   if (window.getSelection && document.createRange) { //Browser compatibility
  //     sel = window.getSelection();
  //     if(sel.toString() == ''){ //no text selection
  //      window.setTimeout(function(){
  //       range = document.createRange(); //range object
  //       range.selectNodeContents(el); //sets Range
  //       sel.removeAllRanges(); //remove all ranges from selection
  //       sel.addRange(range);//add Range to a Selection.
  //     },1);
  //     }

  //   }
  // }

  selectInputText() {
    <HTMLInputElement>this.intentInput.nativeElement.select();
  }

  uploadFile(event) {
    this.textFile = event.target.files[0];
  }


}
