import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {TrainService} from '../train.service';
import * as uikit from 'uikit';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-train-model',
  templateUrl: './train-model.component.html',
  styleUrls: ['./train-model.component.css']
})
export class TrainModelComponent implements OnInit {
  private bots: any;
  private botId: any;
  private intents: any;
  private update_intents: any;
  private selectedUpdateIntent: string;
  private selectedBot: any;
  private botSvps: any;
  private selectedIntent: any;
  private string;
  private has_slots: boolean;
  private canTrainClassifierModel: boolean;
  private canTrainUpdateSenseClassifierModel: boolean;
  private canTrainSvpModel: boolean;
  private trainProgress: boolean;
  private trainCompleted: boolean;
  private intentsWithSvpData: any;

  public successUserMessage: string;
  public errorUserMessage: string;

  constructor(
    private trainService: TrainService,
  ) { }

  ngOnInit() {
    this.getBots();
  }
   getBots() {
    this.trainService.getAllBots().subscribe(
      (res) => {
        // console.log(res);
        this.bots = res;
        // console.log(this.bots);
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
    this.botSvps = [];
    this.trainService.getSingleBot(botId).subscribe(
      (res) => {
        // console.log(res);
        this.selectedBot = res;
        this.getIntentsWithSvpData(this.botId);
        if(this.selectedBot.bot_slots == 'none') {
          this.has_slots = false;
          // console.log(this.has_slots);
        } else {
          this.has_slots = true;
        }
        this.string = this.selectedBot.bot_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.update_intents = this.intents.filter(s => s.includes('update'));
        const botName = this.selectedBot.bot_name;
        if (res) {
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

  getSelectedIntent(event: any) {
    this.selectedIntent = event.target.value;
    if(this.has_slots == true) {
    this.botSvps = [];
    this.getSvps(this.botId, this.selectedIntent);
    }
  }

    getSvps(botId: number, selectedIntent: any) {
    this.trainService.getAllSvps(botId, selectedIntent).subscribe(
      (res) => {
        // console.log(res);
        this.botSvps = [];
        this.botSvps = res;
        if(res.length > 0) {
          this.successUserMessage = 'Success getting svps';
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

  feedIntents(selectedIntent: string) {
    this.trainCompleted = false;
    this.trainProgress = false;
    if(selectedIntent != 'none') {
      this.selectedUpdateIntent = selectedIntent;
    } else {
      this.selectedUpdateIntent = 'none';
    }
    this.trainService.feedIntents(this.botId, this.selectedUpdateIntent).subscribe(
    (res) => {
      // console.log(res);
      if(res.length > 1) {
      this.successUserMessage = 'Success feeding intents';
      this.toggleUserMessage(this.successUserMessage, 'success');
      this.canTrainClassifierModel = true;
      }
      
    },
      (err: HttpErrorResponse) => {
      console.log(err);
      this.errorUserMessage = err.error;
      this.toggleUserMessage(this.errorUserMessage, 'danger');
      }
      );
  }

  feedUpdateSense() {
    this.trainCompleted = false;
    this.trainProgress = false;
    this.trainService.feedUpdateSense(this.botId).subscribe(
    (res) => {
      // console.log(res);
      if(res.length > 1) {
      this.successUserMessage = 'Success feeding Sense Data';
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

 feedSvps(selectedIntent: string) {
    this.trainCompleted = false;
    this.trainProgress = false;
    // console.log(intentData);
    this.trainService.feedSvps(this.botId, selectedIntent).subscribe(
     (res) => {
      //  console.log(res);
      if(res.length > 1) {
        this.successUserMessage = 'Success feeding svps';
        this.toggleUserMessage(this.successUserMessage, 'success');
        this.canTrainSvpModel = true;
      }
      
     },
     (err: HttpErrorResponse) => {
       console.log(err);
       this.errorUserMessage = err.error;
       this.toggleUserMessage(this.errorUserMessage, 'danger');
     }
   );
  }

  trainClassifierModel(selectedIntent) {
    this.show_training_status_model();
    this.trainService.trainClassifierModel(selectedIntent).subscribe(
      (res) => {
        // console.log(res);
        if(res.length > 1) {
          this.successUserMessage = 'Success training classifier model';
          this.toggleUserMessage(this.successUserMessage, 'success');
          this.trainCompleted = true;
          this.trainProgress = false;
        }
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
        this.hide_training_status_model();
      }
    );
  }

  trainUpdateSenseClassifierModel() {
    this.canTrainUpdateSenseClassifierModel = false;
    this.show_training_status_model();

    this.trainService.trainUpdateSenseClassifierModel().subscribe(
      (res) => {
        // console.log(res);
        if(res.length > 1) {
          this.successUserMessage = 'Success training update sense classifier model';
          this.toggleUserMessage(this.successUserMessage, 'success');
          this.trainCompleted = true;
          this.trainProgress = false;
        }
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
        this.hide_training_status_model();
      }
    );

  }

    trainSvpModel(selectedIntent: string) {
    this.canTrainSvpModel = false;
    this.trainCompleted = false;
    this.trainProgress = true;
    this.show_training_status_model();
    this.trainService.trainSvpModel(selectedIntent).subscribe(
      (res) => {
        // console.log(res);
        if(res.length > 1) {
          this.successUserMessage = 'Success training svp model';
          this.toggleUserMessage(this.successUserMessage, 'success');
          this.trainCompleted = true;
          this.trainProgress = false;
        }
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
        this.hide_training_status_model();
      }
    );
  }

  getIntentsWithSvpData(botId) {
    this.trainService.getIntentsWithSvpData(botId).subscribe(
      (res) => {
        // console.log(res);
          this.intentsWithSvpData = res;
          this.successUserMessage = 'Success getting intents with svp data';
          this.toggleUserMessage(this.successUserMessage, 'success');
          this.trainCompleted = true;
          this.trainProgress = false;
       
      },
      (err: HttpErrorResponse) => {
        console.log(err);
        this.errorUserMessage = err.error;
        this.toggleUserMessage(this.errorUserMessage, 'danger');
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

  toggleUserMessage(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

  show_training_status_model() {
    this.trainCompleted = false;
    this.trainProgress = true;
    uikit.modal('#training_status_modal').show();
  }  

  hide_training_status_model() {
    uikit.modal('#training_status_modal').hide();
  }  
     
}