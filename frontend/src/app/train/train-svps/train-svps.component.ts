import {AfterViewInit, Component, ElementRef, Inject, inject, OnInit, Renderer, ViewChild} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SlotEntity } from '../../models/slot-entity';
import * as uikit from 'uikit';
import { SlotValuePairing } from '../../models/slot-entity';
import {TrainService} from '../train.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Svp} from '../../models/svp.model';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-train-svps',
  templateUrl: './train-svps.component.html',
  styleUrls: ['./train-svps.component.css']
})
export class TrainSvpsComponent implements OnInit {
  @ViewChild('utteranceToLabel', {static: false}) utteranceToLabel: ElementRef;
  @ViewChild('contentBox', {static: false}) contentBox: ElementRef;
  @ViewChild('labelQueue', {static: false}) labelQueue: ElementRef;
  createSvpForm: FormGroup;
  svpModel = new Svp();
  private uttToLabel = '';
  private slotValue: string;
  private text: string;
  private startIndex: number;
  private endIndex: number;
  private lenOfStr: number;
  private slotEntity: any;
  private slotEntities: any[];
  private slotData: string;
  permanent: string;
  temp: string;
  public entity: any;
  public showLabelModal = false;
  public label = '';
  public slotValuePairings: any[];
  public slotValuePair: any;
  private bots: any;
  private bot: any;
  private botId: any;
  private intents: any;
  private selectedIntent: any;
  private string;
  private slots: any;
  private has_slots: boolean;
  private botSvps: any;
  public elem: any;
  public str: any;
  public aiSlots: any;
  public slotItems: any;
  public remSqbrac: any;
  public slotArrayTemp: any;
  public slotArray: any;
  public startIndexP: any;
  public endIndexP: any;
  public slotLabel: any;
  public slotValueP: any;
  private intentsAndUtterances: any;

  public successUserMessage: string;
  public errorUserMessage: string;

  constructor(@Inject(DOCUMENT) private document: Document,
              private trainService: TrainService,
              private formBuilder: FormBuilder,
              private renderer: Renderer,
              private elemRef: ElementRef) {
  }

  ngOnInit() {
    this.slotValuePairings = [];
    this.getBots();
    this.initializeCreateSvpForm();
  }

  initializeCreateSvpForm(): void {
    this.createSvpForm = this.formBuilder.group({
      bot_id: [this.svpModel.botId, Validators.required],
      slots: [this.svpModel.slots, Validators.required],
      utterance: [this.svpModel.utterance, Validators.required],
      svp_data: [this.svpModel.svpData, Validators.required],
      intent: [this.svpModel.intent, Validators.required]
    });
  }

  getNewUtteranceToLabel() {
    this.slotData = '';
    this.uttToLabel = '';
    this.uttToLabel = this.utteranceToLabel.nativeElement.value;
    if(this.labelQueue.nativeElement.innerHTML.length > 2) {
      this.labelQueue.nativeElement.innerHTML = this.uttToLabel;
    }
    this.slotEntities = [];
    this.permanent = '';
    this.successUserMessage = 'Success sending to label queue';
    this.toggleUserMessage(this.successUserMessage, 'success');
  }

  getUtteranceFromIntentData(i) {
    this.uttToLabel = '';
    this.uttToLabel = this.intentsAndUtterances[i].utterance;
    this.slotEntities = [];
    this.permanent = '';
    this.successUserMessage = 'Success sending to label queue';
    this.toggleUserMessage(this.successUserMessage, 'success');
  }

  // labelSlot() {
  //   this.slotEntity = new SlotEntity();
  //   this.text = '';
  //   if (window.getSelection) {
  //     this.text = window.getSelection().toString();
  //     if (this.text.length > 1 && this.uttToLabel.length > 1) {
  //       this.toggleLabelModal();
  //     }
  //   }
  // }


  labelSlot() {
    this.slotEntity = new SlotEntity();
    this.text = '';
    if (window.getSelection().type === 'Range') {
      this.text = window.getSelection().toString();
      // const selection = window.getSelection().getRangeAt(0);
      // const selectedText = selection.extractContents();
      // let span = document.createElement("span");
      // span.className = "highlight";
      // span.style.backgroundColor = "yellow";
      // span.appendChild(selectedText);
      // selection.insertNode(span);

      if (this.text.length > 1 && this.uttToLabel.length > 1) {
        this.toggleLabelModal();
      }
    }

  }

  toggleLabelModal() {
    this.showLabelModal = !this.showLabelModal;

    if (this.showLabelModal) {
      uikit.modal('#modal').show();
    } else {
      uikit.modal('#modal').hide();
    }
  }

  getLabel(event: any) {
    this.label = event.target.value;
    if (this.label.length > 1) {
      this.toggleLabelModal();
      this.slotValue = this.text;
      this.startIndex = this.uttToLabel.indexOf(this.slotValue);
      this.slotEntity.startIndex = this.startIndex;
      this.lenOfStr = this.slotValue.length;
      this.endIndex = this.startIndex + this.lenOfStr;
      this.slotEntity.endIndex = this.endIndex;
      this.slotEntity.slot = this.label;

      this.slotEntities.push(this.slotEntity);
      for (this.entity of this.slotEntities) {
        this.temp = '';
        this.temp = '[' + this.entity.startIndex + ',' + this.entity.endIndex + ',' + '"' + this.entity.slot + '"' + ']';
      }
      if (this.permanent.length > 0) {
        this.permanent = this.permanent + ',' + this.temp;
      } else {
        this.permanent = this.permanent + this.temp;
      }
      // tslint:disable-next-line:max-line-length
      // console.log(this.permanent)
      this.slotData = '[' + '"' + this.uttToLabel + '"' + ',' + '{' + '"' + 'entities' + '"' + ':' + '[' + this.permanent + ']' + '}' + ']';
      this.slotValuePair = new SlotValuePairing();
      this.slotValuePair.slot = this.label;
      this.slotValuePair.value = this.slotValue;
      this.slotValuePairings.push(this.slotValuePair);

      this.createSvpForm.patchValue({
        svp_data: this.slotData,
        utterance: this.uttToLabel,
        slots: this.permanent,
        intent: this.selectedIntent
      });
    }
  }

  clearAll() {
    this.slotValuePairings = [];
    this.slotValuePair.slot = '';
    this.slotValuePair.value = '';   
    this.uttToLabel = '';
    this.permanent = '';
    this.slotData = '';
    this.createSvpForm.patchValue({
      svp_data: '',
    });
    this.successUserMessage = 'Success clearing svp';
    this.toggleUserMessage(this.successUserMessage, 'success');
    
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
    this.intentsAndUtterances = [];
    this.botSvps = [];
    this.botId = botId
    this.trainService.getSingleBot(botId).subscribe(
      (res) => {
         // console.log(res);
        this.bot = res;
        if(this.bot.bot_slots == 'none') {
          this.has_slots = false;
          // console.log(this.has_slots);
        } else {
          this.has_slots = true;
        }
        this.string = this.bot.bot_slots.replace(/\s/g, '');
        this.slots = this.string.split(',');
        this.string = this.bot.bot_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.createSvpForm.patchValue({
          bot_id: this.bot.id
        });
        const botName = this.bot.bot_name;
        if(res) {
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
    if (this.has_slots == true) {
      this.intentsAndUtterances = [];
      this.getIntents(this.botId, this.selectedIntent);
      this.botSvps = [];
      this.getSvps(this.botId, this.selectedIntent);
    }
  }

  getSvps(botId: number, selectedIntent: any) {
    this.trainService.getAllSvps(botId, selectedIntent).subscribe(
      (res) => {
        //  console.log(res);
        this.botSvps = [];
        this.botSvps = res;
        setTimeout(() => this.parseSvpData(), 5);
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

  getIntents(botId: number, selectedIntent: any) {
    this.trainService.getAllIntents(botId, selectedIntent).subscribe(
      (res) => {
        //  console.log(res);
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

  createSvpFormSubmit() {
    const data = this.createSvpForm.getRawValue();
    // console.log(data);
    if (data.bot_id && data.svp_data) {
      this.trainService.createSvp(data).subscribe(
        (res) => {
          //  console.log(res);
          // this.botSvps.unshift(res);
          if(res) {
          this.getSvps(data.bot_id, this.selectedIntent);
          this.clearAll();
          this.successUserMessage = 'Success creating svp';
          this.toggleUserMessage(this.successUserMessage, 'success');
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this.errorUserMessage = err.error;
          this.toggleUserMessage(this.errorUserMessage, 'danger');
        }
      );
    } else {
      this.errorUserMessage = 'No svp to save';
      this.toggleUserMessage(this.errorUserMessage, 'danger');
    }
  }

  deleteSvp(svpId, i) {
    this.trainService.deleteSingleSvp(svpId).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.botSvps.splice(i, 1);
        this.successUserMessage = 'Success deleting svp';
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

  parseSvpData() {
    const utterances = this.elemRef.nativeElement.querySelectorAll('.utterance');
    utterances.forEach(utterance => {
      this.str = utterance.querySelectorAll('.utt')[0].innerText;
      this.aiSlots = utterance.querySelectorAll('.ai_slots')[0].value;
      this.aiSlots = this.aiSlots.replace(/([^,],[^,]*?,[^,]*?),/g, '$1&');
      this.slotArray = this.aiSlots.split('&');
      for (const i of this.slotArray) {
        this.slotItems = i;
        this.remSqbrac = this.slotItems.replace(/['"\[\]']+/g, '');
        this.slotArrayTemp = this.remSqbrac.split(',');
        this.startIndexP = this.slotArrayTemp[0];
        this.endIndexP = this.slotArrayTemp[1];
        this.slotLabel = this.slotArrayTemp[2];
        this.slotValueP = this.str.substring(this.startIndexP, this.endIndexP);
        // tslint:disable-next-line:max-line-length
        utterance.querySelectorAll('.slots_span')[0].innerHTML += ' <span class="uk-badge uk-padding-small">' + this.slotLabel + ':&nbsp; ' + '<span class="uk-text-bolder">' + this.slotValueP + '</span>'  + '</span>';
      }
    });

  }
  toggleUserMessage(notificationMessage, status) {
    uikit.notification(notificationMessage, {pos: 'bottom-right', status: status});
  }

}
