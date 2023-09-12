import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

// SERVICES //
import { IntentService } from 'app/chatbot-design-studio/services/intent.service';
import { LoggerService } from 'app/services/logger/logger.service';
 
// MODEL //
import { Intent } from 'app/models/intent-model';

// UTILS //
import { moveItemToPosition } from 'app/chatbot-design-studio/utils';

@Component({
  selector: 'cds-panel-intent-list',
  templateUrl: './cds-panel-intent-list.component.html',
  styleUrls: ['./cds-panel-intent-list.component.scss']
})

export class CdsPanelIntentListComponent implements OnInit, OnChanges {

  private subscriptionListOfIntents: Subscription;

  
  @Input() IS_OPEN: boolean;
  @Input() intent_id: string;
  @Output() selectIntent = new EventEmitter();
  @Output() deleteIntent = new EventEmitter();
 


  listOfIntents: Intent[] = [];
  internalIntents: Intent[] = [];
  defaultIntents: Intent[] = [];
  filteredIntents: Intent[] = [];
  
  idSelectedIntent: string;


  TOPIC_INTERNAL = 'internal';
  DISPLAY_NAME_START = "start";
  DISPLAY_NAME_DEFAULT_FALLBACK = "defaultFallback";
  ICON_DEFAULT = 'label_important_outline';
  ICON_ROCKET = 'rocket_launch';
  ICON_UNDO = 'undo';

  constructor(
    private logger: LoggerService,
    private intentService: IntentService
  ) { 
    this.setSubscriptions();
  }

  ngOnInit(): void {
    // console.log('ngOnInit:: ');
    this.idSelectedIntent = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('[CdsPanelIntentListComponent] ngOnChanges::', this.listOfIntents);
  }

  /** ngOnDestroy */
  ngOnDestroy() {
    if (this.subscriptionListOfIntents) {
      this.subscriptionListOfIntents.unsubscribe();
    }
  }


  /** SUBSCRIBE TO THE INTENT LIST */
  /**
   * Creo una sottoscrizione all'array di INTENT per averlo sempre aggiornato
   * ad ogni modifica (aggiunta eliminazione di un intent)
   */
  private setSubscriptions(){
    this.subscriptionListOfIntents = this.intentService.getIntents().subscribe(intents => {
      console.log('[cds-panel-intent-list] --- AGGIORNATO ELENCO INTENTS ',intents);
      if(intents && intents.length>0){
        this.initialize(intents);
      }
    });
  }

  /** initialize */
  private initialize(intents){
    this.internalIntents = intents.filter(obj => ( obj.intent_display_name.trim() === this.DISPLAY_NAME_START || obj.intent_display_name.trim() === this.DISPLAY_NAME_DEFAULT_FALLBACK));
    this.defaultIntents = intents.filter(obj => ( obj.intent_display_name.trim() !== this.DISPLAY_NAME_START && obj.intent_display_name.trim() !== this.DISPLAY_NAME_DEFAULT_FALLBACK));
    this.internalIntents = moveItemToPosition(this.internalIntents, this.DISPLAY_NAME_START, 0);
    this.internalIntents = moveItemToPosition(this.internalIntents, this.DISPLAY_NAME_DEFAULT_FALLBACK, 1);
    this.filteredIntents = this.defaultIntents;
    if(!this.listOfIntents || this.listOfIntents.length == 0){
      this.idSelectedIntent = this.internalIntents[0].intent_id;
      this.intentService.setDefaultIntentSelected(this.internalIntents[0]);
    } 
    this.listOfIntents = intents;
    const resp = this.listOfIntents.find((intent) => intent.intent_id === this.idSelectedIntent);
    if(!resp){
      this.idSelectedIntent = null;
    }
  }


  /** EVENTS  */

  /** onGetIconForName */
  onGetIconForName(name: string){
    let icon = this.ICON_DEFAULT;
    if (name.trim() === this.DISPLAY_NAME_START) {
      icon = this.ICON_ROCKET;
    } else if (name.trim() === this.DISPLAY_NAME_DEFAULT_FALLBACK) {
      icon = this.ICON_UNDO;
    }
    return icon;
  }

  /** Search a block... */
  onLiveSearch(text: string) {
    this.filteredIntents = this.defaultIntents.filter(element => element.intent_display_name.toLowerCase().includes(text.toLowerCase()));
  }

  /** onSelectIntent */
  onSelectIntent(intent: Intent) {
    this.idSelectedIntent = intent.intent_id;
    this.selectIntent.emit(intent);
  }

  /** onDeleteIntent */
  onDeleteIntent(intent: Intent) {
    this.deleteIntent.emit(intent);
  }


}