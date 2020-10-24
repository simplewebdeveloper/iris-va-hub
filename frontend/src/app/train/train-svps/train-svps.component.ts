import { AfterViewInit, Component, ElementRef, Inject, inject, OnInit, Renderer, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { SlotEntity } from '../../models/slot-entity';
import * as uikit from 'uikit';
import { SlotValuePairing } from '../../models/slot-entity';
import { TrainService } from '../train.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Svp } from '../../models/svp.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-train-svps',
  templateUrl: './train-svps.component.html',
  styleUrls: ['./train-svps.component.css']
})
export class TrainSvpsComponent implements OnInit {
  @ViewChild('utterance_to_label', {static: false}) utterance_to_label: ElementRef;
  @ViewChild('contentBox', {static: false}) contentBox: ElementRef;
  @ViewChild('label_queue', {static: false}) label_queue: ElementRef;
  create_svp_form: FormGroup;
  svp_model = new Svp();
  private utt_to_label = '';
  private slot_value: string;
  private text: string;
  private start_index: number;
  private end_index: number;
  private len_of_str: number;
  private slot_entity: any;
  private slot_entities: any[];
  private slot_data: string;
  permanent: string;
  temp: string;
  public entity: any;
  public show_label_modal = false;
  public label = '';
  public slot_value_pairings: any[];
  public slot_value_pair: any;
  private vas: any;
  private va: any;
  private va_id: any;
  private intents: any;
  private selected_intent: any;
  private string;
  private slots: any;
  private has_slots: boolean;
  private va_svps: any;
  public elem: any;
  public str: any;
  public ai_slots: any;
  public slot_items: any;
  public rem_sqbrac: any;
  public slot_array_temp: any;
  public slot_array: any;
  public start_index_p: any;
  public end_index_p: any;
  public slot_label: any;
  public slot_value_p: any;
  intents_and_utterances: any;

  public success_user_message: string;
  public error_user_message: string;

  constructor(@Inject(DOCUMENT) private document: Document,
              private train_service: TrainService,
              private form_builder: FormBuilder,
              private renderer: Renderer,
              private elem_ref: ElementRef,
              private route: ActivatedRoute,
              ) {
  }

  ngOnInit() {
    this.slot_value_pairings = [];
    // this.get_vas();
    this.initialize_create_svp_form();
    this.get_va_from_url();
  }

  initialize_create_svp_form(): void {
    this.create_svp_form = this.form_builder.group({
      va_id: [this.svp_model.va_id, Validators.required],
      slots: [this.svp_model.slots, Validators.required],
      utterance: [this.svp_model.utterance, Validators.required],
      svp_data: [this.svp_model.svp_data, Validators.required],
      intent: [this.svp_model.intent, Validators.required]
    });
  }

  get_new_utterance_to_label() {
    this.slot_data = '';
    this.utt_to_label = '';
    this.utt_to_label = this.utterance_to_label.nativeElement.value;
    if(this.label_queue.nativeElement.innerHTML.length > 2) {
      this.label_queue.nativeElement.innerHTML = this.utt_to_label;
    }
    this.slot_entities = [];
    this.permanent = '';
    this.success_user_message = 'Success sending to label queue';
    this.toggle_user_message(this.success_user_message, 'success');
  }

  get_utterance_from_intent_data(i) {
    this.utt_to_label = '';
    this.utt_to_label = this.intents_and_utterances[i].utterance;
    this.label_queue.nativeElement.innerHTML = this.utt_to_label;
    this.slot_entities = [];
    this.permanent = '';
    this.success_user_message = 'Success sending to label queue';
    this.toggle_user_message(this.success_user_message, 'success');
  }

  // labelSlot() {
  //   this.slot_entity = new slot_entity();
  //   this.text = '';
  //   if (window.getSelection) {
  //     this.text = window.getSelection().toString();
  //     if (this.text.length > 1 && this.utt_to_label.length > 1) {
  //       this.toggle_label_modal();
  //     }
  //   }
  // }


  label_slot() {
    this.slot_entity = new SlotEntity();
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

      if (this.text.length > 1 && this.utt_to_label.length > 1) {
        this.toggle_label_modal();
      }
    }

  }

  toggle_label_modal() {
    this.show_label_modal = !this.show_label_modal;

    if (this.show_label_modal) {
      uikit.modal('#modal').show();
    } else {
      uikit.modal('#modal').hide();
    }
  }

  get_label(event: any) {
    this.label = event.target.value;
    // console.log(this.label)
    if (this.label.length > 1) {
      this.toggle_label_modal();
      this.slot_value = this.text;
      this.start_index = this.utt_to_label.indexOf(this.slot_value);
      this.slot_entity.start_index = this.start_index;
      this.len_of_str = this.slot_value.length;
      this.end_index = this.start_index + this.len_of_str;
      this.slot_entity.end_index = this.end_index;
      this.slot_entity.slot = this.label;

      this.slot_entities.push(this.slot_entity);
      for (this.entity of this.slot_entities) {
        this.temp = '';
        this.temp = '[' + this.entity.start_index + ',' + this.entity.end_index + ',' + '"' + this.entity.slot + '"' + ']';
      }
      if (this.permanent.length > 0) {
        this.permanent = this.permanent + ',' + this.temp;
      } else {
        this.permanent = this.permanent + this.temp;
      }
      // tslint:disable-next-line:max-line-length
      // console.log(this.permanent)
      this.slot_data = '[' + '"' + this.utt_to_label + '"' + ',' + '{' + '"' + 'entities' + '"' + ':' + '[' + this.permanent + ']' + '}' + ']';
      this.slot_value_pair = new SlotValuePairing();
      this.slot_value_pair.slot = this.label;
      this.slot_value_pair.value = this.slot_value;
      this.slot_value_pairings.push(this.slot_value_pair);

      this.create_svp_form.patchValue({
        svp_data: this.slot_data,
        utterance: this.utt_to_label,
        slots: this.permanent,
        intent: this.selected_intent
      });

      // console.log(this.selected_intent)
    }
  }

  clear_all() {
    this.slot_value_pairings = [];
    this.slot_value_pair.slot = '';
    this.slot_value_pair.value = '';   
    this.utt_to_label = '';
    this.permanent = '';
    this.slot_data = '';
    this.create_svp_form.patchValue({
      svp_data: '',
    });
    this.success_user_message = 'Success clearing svp';
    this.toggle_user_message(this.success_user_message, 'success');
    
  }

  get_vas() {
    this.train_service.get_vas().subscribe(
      (res) => {
        // console.log(res);
        this.vas = res;
        if(res.length > 0) {
        this.success_user_message = 'Success getting vas';
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

  get_va_from_url() {
    this.va = null;
    const va_id_from_url = +this.route.snapshot.paramMap.get('va_id');
    this.intents_and_utterances = [];
    this.va_svps = [];
    this.va_id = va_id_from_url
    this.train_service.get_single_va(va_id_from_url).subscribe(
      (res) => {
        //  console.log(res);
        this.va = res;
        if(this.va.va_slots == 'none') {
          this.has_slots = false;
          // console.log(this.has_slots);
        } else {
          this.has_slots = true;
        }
        this.string = this.va.va_slots.replace(/\s/g, '');
        this.slots = this.string.split(',');
        this.string = this.va.va_intents.replace(/\s/g, '');
        this.intents = this.string.split(',');
        this.create_svp_form.patchValue({
          va_id: this.va.id
        });
        const va_name = this.va.va_name;
        if(res) {
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
    if (this.has_slots == true) {
      this.intents_and_utterances = [];
      this.get_intents(this.va_id, this.selected_intent);
      this.va_svps = [];
      this.get_svps(this.va_id, this.selected_intent);
    }
  }

  get_svps(va_id: number, selected_intent: any) {
    this.train_service.get_all_svps(va_id, selected_intent).subscribe(
      (res) => {
        //  console.log(res);
        this.va_svps = [];
        this.va_svps = res;
        setTimeout(() => this.parse_svp_data(), 5);
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

  get_intents(va_id: number, selected_intent: any) {
    this.train_service.get_all_intents(va_id, selected_intent).subscribe(
      (res) => {
        //  console.log(res);
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

  create_svp_form_submit() {
    const data = this.create_svp_form.getRawValue();
    // console.log(data)
    if (data.va_id && data.svp_data) {
      this.train_service.create_svp(data).subscribe(
        (res) => {
          //  console.log(res);
          // this.va_svps.unshift(res);
          if(res) {
          this.get_svps(data.va_id, this.selected_intent);
          this.clear_all();
          this.success_user_message = 'Success creating svp';
          this.toggle_user_message(this.success_user_message, 'success');
          }
        },
        (err: HttpErrorResponse) => {
          console.log(err);
          this.error_user_message = err.error;
          this.toggle_user_message(this.error_user_message, 'danger');
        }
      );
    } else {
      this.error_user_message = 'No svp to save';
      this.toggle_user_message(this.error_user_message, 'danger');
    }
  }

  delete_svp(svpId, i) {
    this.train_service.delete_single_svp(svpId).subscribe(
      (res) => {
        // console.log(res);
        if(res) {
        this.va_svps.splice(i, 1);
        this.success_user_message = 'Success deleting svp';
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

  parse_svp_data() {
    const utterances = this.elem_ref.nativeElement.querySelectorAll('.utterance');
    utterances.forEach(utterance => {
      this.str = utterance.querySelectorAll('.utt')[0].innerText;
      this.ai_slots = utterance.querySelectorAll('.ai_slots')[0].value;
      // console.log(this.ai_slots);
      
      this.ai_slots = this.ai_slots.replace(/([^,],[^,]*?,[^,]*?),/g, '$1&');
      this.slot_array = this.ai_slots.split('&');
      for (const i of this.slot_array) {
        this.slot_items = i;
        this.rem_sqbrac = this.slot_items.replace(/['"\[\]']+/g, '');
        this.slot_array_temp = this.rem_sqbrac.split(',');
        this.start_index_p = this.slot_array_temp[0];
        this.end_index_p = this.slot_array_temp[1];
        this.slot_label = this.slot_array_temp[2];
        this.slot_value_p = this.str.substring(this.start_index_p, this.end_index_p);
        // tslint:disable-next-line:max-line-length
        utterance.querySelectorAll('.slots_span')[0].innerHTML += ' <span class="uk-badge uk-padding-small">' + this.slot_label + ':&nbsp; ' + '<span class="uk-text-bolder">' + this.slot_value_p + '</span>'  + '</span>';
      }
    });

  }
  toggle_user_message(notification_message, status) {
    uikit.notification(notification_message, { pos: 'bottom-right', status: status });
  }

}
