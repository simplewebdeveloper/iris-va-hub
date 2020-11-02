import { Component, OnInit } from '@angular/core';
import { ResponseService } from '../response.service';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.css'],
  providers: [ResponseService]
})
export class ResponseComponent implements OnInit {

  constructor(private responseService: ResponseService) { }

  ngOnInit() {
  }

  save(template){
   console.log(template);
    this.responseService.create_response({template, va: 23, project: 21}).subscribe((res)=>{
      console.log(res);
    }, (err)=>{
      console.log(err);
    })
  }

}
