// tslint:disable:max-line-length
import { Component, OnInit, Input, Output, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { DepartmentService } from '../services/department.service';
import { BotService } from '../services/bot.service'; // no more used
import { FaqKbService } from '../services/faq-kb.service';
import { Project } from '../models/project-model';
import { AuthService } from '../core/auth.service';
import { GroupService } from '../services/group.service';
import { Group } from '../models/group-model';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { NotifyService } from '../core/notify.service';
import { slideInOutAnimation } from '../_animations/index';
import { UsersService } from '../services/users.service';
import { avatarPlaceholder, getColorBck } from '../utils/util';
import { AppConfigService } from '../services/app-config.service';
import { ComponentCanDeactivate } from '../core/pending-changes.guard';
import { Observable } from 'rxjs/Observable';
declare const $: any;
const swal = require('sweetalert');

@Component({
  selector: 'app-department-edit-add',
  templateUrl: './department-edit-add.component.html',
  styleUrls: ['./department-edit-add.component.scss'],
  // animations: [slideInOutAnimation],
  // tslint:disable-next-line:use-host-property-decorator
  // host: { '[@slideInOutAnimation]': '' }
})
// , ComponentCanDeactivate
export class DepartmentEditAddComponent implements OnInit, AfterViewInit, ComponentCanDeactivate {

  @Input() ws_requestslist_deptIdSelected: string;
  @Input() display_dept_sidebar: boolean;

  @ViewChild("navbarbrand") private navbarbrandRef: ElementRef;

  CREATE_VIEW = false;
  EDIT_VIEW = false;
  id_dept: string;
  dept_name: string; // not more used
  dept_description: string; // not more used

  deptName_toUpdate: string;
  dept_description_toUpdate: string;

  // !!! NOTE: IS CALLED BOT LIST BUT REALLY IS THE LIST OF FAQ-KB LIST
  botsList: any;
  selectedBotId: string;
  selectedGroupId: string;
  SHOW_GROUP_OPTION_FORM: boolean;
  ROUTING_SELECTED: string;

  botId: string;
  selectedValue: string;
  selectedId: string;
  botIdEdit: string;
  dept_routing: string;
  project: Project;
  groupsList: Group[];
  GROUP_ID_NOT_EXIST: boolean;
  has_selected_bot: boolean
  BOT_NOT_SELECTED: boolean;
  SHOW_OPTION_FORM: boolean;
  has_selected_only_bot: boolean;
  bot_only: boolean;
  onlybot_disable_routing: boolean;
  createSuccessMsg: string;
  createErrorMsg: string;
  updateSuccessMsg: string;
  updateErrorMsg: string;
  showSpinner = false;
  projectUsers: any;
  projectUsersInGroup: any;

  dept_name_initial: string
  dept_name_fillcolour: string
  dept_created_at: string
  dept_ID: string;

  bot_type: string;
  storageBucket: string;
  group_name: string;
  bot_description: string;
  ROUTING_PAGE_MODE: boolean;
  IS_DEFAULT_DEPT: boolean;

  display_btn_read_all_descr: boolean;
  read_all: boolean

  OPEN_CREATE_GROUP_RIGHT_SIDEBAR = false;
  OPEN_CREATE_BOT_RIGHT_SIDEBAR = false;
  train_bot_sidebar_height: any;
  newInnerWidth: any;
  newInnerHeight: any;
  main_content_height: any
  new_group_created_id: string;
  SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false

  HAS_COMPLETED_GET_GROUPS: boolean;
  NOT_HAS_EDITED: boolean = true;

  areYouSureMsg: string;
  youHaveUnsavedChangesMsg: string;
  cancelMsg: string;
  areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving: string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mongodbDepartmentService: DepartmentService,
    private botService: BotService,
    private faqKbService: FaqKbService,
    private auth: AuthService,
    private groupService: GroupService,
    public location: Location,
    public translate: TranslateService,
    private notify: NotifyService,
    private usersService: UsersService,
    public appConfigService: AppConfigService
  ) { }


  // ------------------------------------------------------------------------------------------------------------------------------------------------------
  // @ canDeactivate 1st method  https://stackoverflow.com/questions/35922071/warn-user-of-unsaved-changes-before-leaving-page?rq=1
  // modified to display a custom modal (see here https://stackoverflow.com/questions/55013903/angular-candeactivate-guard-not-working-with-sweet-alert-js)
  // ------------------------------------------------------------------------------------------------------------------------------------------------------
  // @HostListener('window:beforeunload')

  @HostListener('window:beforeunload', ['$event'])
  onbeforeunload(event) {
    if (this.NOT_HAS_EDITED === false) {
      event.preventDefault();
      event.returnValue = false;
    }
  }
  canDeactivate(): Observable<boolean> | boolean {
    // insert logic to check if there are pending changes here;
    // returning true will navigate without confirmation
    // returning false will show a confirm dialog before navigating away

    if (this.NOT_HAS_EDITED === true) {
      return true;

    } else if (this.NOT_HAS_EDITED === false) {

      // areYouSureMsg
      // youHaveUnsavedChangesMsg
      // cancelMsg
      // this.cancelMsg,
      return swal({
        // title: this.areYouSureMsg,
        text: this.areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving,
        icon: "warning",
        buttons: true,
        // dangerMode: true,
      })
        .then((willRemain) => {
          if (willRemain) {
            console.log('showExitFromComponentConfirmation willRemain pressed OK')

            return true;

          } else {
            console.log('showExitFromComponentConfirmation willRemain else')

            return false;

          }
        });
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {

    this.newInnerWidth = event.target.innerWidth;
    console.log('DEPT-EDIT-ADD - ON RESIZE -> WINDOW WITH ', this.newInnerWidth);


    this.newInnerHeight = event.target.innerHeight;
    console.log('DEPT-EDIT-ADD - ON RESIZE -> WINDOW HEIGHT ', this.newInnerHeight);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.main_content_height = elemMainContent.clientHeight
    console.log('DEPT-EDIT-ADD - ON RESIZE -> MAIN CONTENT HEIGHT', this.main_content_height);

    // determine the height of the modal when the width of the window is <= of 991px when the window is resized
    // RESOLVE THE BUG: @media screen and (max-width: 992px) THE HEIGHT OF THE  MODAL 'USERS LIST' IS NOT 100%
    // if (this.newInnerWidth <= 991) { // nk gli tolgo la condizione dato che il bug si verifica anche pima del @media < 992
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 'px'
    // console.log('%%% Ws-REQUESTS-Msgs - *** MODAL HEIGHT ***', this.users_list_modal_height);
    // }

    // ------------------------------
    // Right sidebar width on resize
    // ------------------------------
    // const rightSidebar = <HTMLElement>document.querySelector(`.right-card`);
    // this.rightSidebarWidth = rightSidebar.offsetWidth
  }

  ngOnInit() {
    this.auth.checkRoleForCurrentProject();
    this.getStorageBucket();

    console.log('DEPT-EDIT-ADD selectedDeptId FROM @INPUT: ', this.ws_requestslist_deptIdSelected)
    console.log('DEPT-EDIT-ADD display_dept_sidebar FROM @INPUT: ', this.display_dept_sidebar)

    // toDo: to call the department detail as a sidebar in the request list
    // if (this.display_dept_sidebar === true) {
    //   this.EDIT_VIEW = true;
    //   this.id_dept = this.ws_requestslist_deptIdSelected;
    //   this.getDeptById();
    // }



    /**
     * BASED ON THE URL PATH DETERMINE IF THE USER HAS SELECTED (IN DEPARTMENTS PAGE) 'CREATE' OR 'EDIT' OR  ROUTING
     */
    // if (this.router.url === '/create') {

    if (this.router.url.indexOf('/create') !== -1) {

      console.log('++ DEPT DTLS HAS CLICKED CREATE ');
      this.CREATE_VIEW = true;
      // this.showSpinner = false;
      // this.SHOW_OPTION_FORM = true;
      // this.ROUTING_SELECTED = 'fixed';

      this.ROUTING_SELECTED = 'assigned';
      this.dept_routing = 'assigned';

      this.SHOW_OPTION_FORM = false; // to check if is used
      this.BOT_NOT_SELECTED = true;
      this.has_selected_bot = false;
      this.selectedBotId = null;
      console.log('ON INIT (IF HAS SELECT CREATE) SHOW OPTION FORM ', this.SHOW_OPTION_FORM, 'ROUTING SELECTED ', this.ROUTING_SELECTED);
      this.ROUTING_PAGE_MODE = false;

    } else if (this.router.url.indexOf('/edit') !== -1) {
      console.log('++ DEPT DTLS - HAS CLICKED EDIT DEPT');
      this.EDIT_VIEW = true;
      this.showSpinner = true;
      this.SHOW_OPTION_FORM = false; // to check if is used
      this.ROUTING_PAGE_MODE = false;

      // *** GET DEPT ID FROM URL PARAMS AND THEN DEPT BY ID ***
      this.getParamsAndDeptById();


    } else if (this.router.url.indexOf('/routing') !== -1) {

      console.log('++ DEPT DTLS HAS CLICKED ROUTING FROM SIDEBAR');
      this.EDIT_VIEW = true;
      this.SHOW_OPTION_FORM = false; // to check if is used
      this.showSpinner = true;

      this.ROUTING_PAGE_MODE = true;

      // *** GET DEPT ID FROM URL PARAMS AND THEN DEPT BY ID ***
      this.getParamsAndDeptById();


    }

    this.getCurrentProject();

    /**
     * ======================= GET FAQ-KB LIST =========================
     * THE FAQ-KB LIST COME BACK FROM THE CALLBACK
     * IS USED TO POPULATE THE DROP-DOWN LIST 'SELECT A BOT' OF CREATE VIEW AND OF IN THE EDIT VIEW)
     */
    this.getFaqKbByProjecId()

    this.getUsersAndGroup()
    // this.getProjectUsers();

    this.translateLabels()
  }

  // -------------------------------------------------------------------------------------
  // @ canDeactivate NOT_HAS_EDITED is to canDeactivate if is false is displayed the alert
  // -------------------------------------------------------------------------------------
  onChangeDeptName($event) {
    console.log('DEPT EDIT-ADD - onChangeDeptName ', $event);
    this.NOT_HAS_EDITED = false
  }


  onChangeDeptDescription($event) {
    console.log('DEPT EDIT-ADD - onChangeDeptDescription ', $event);
    this.NOT_HAS_EDITED = false
  }


  // -----------------------------------------------------------------------------
  // @ CREATE GROUP RIGHT SIDEBAR
  // -----------------------------------------------------------------------------

  // OPEN * CREATE GROUP RIGHT SIDEBAR *
  openCreateGroupRightSideBar() {

    // SCOLL TO TOP WHEN THE USER CLICK 'CREATE A NEW GROUP'
    this.navbarbrandRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR = true
    console.log('DEPT EDIT-ADD - OPEN CREATE GROUP SIDEBAR ', this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('DEPT EDIT-ADD  - OPEN CREATE GROUP SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');

    // const elemFooter = <HTMLElement>document.querySelector('footer');
    // elemFooter.setAttribute('style', 'display:none;');

  }

  // HALDLE OUTPUT 'CLOSE SIDEBAR' * CREATE GROUP RIGHT SIDEBAR *
  handleCloseCreateGroupSidebar(event) {
    this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR = event;
    console.log('DEPT EDIT-ADD - CLOSE CREATE GROUP SIDEBAR ', this.OPEN_CREATE_GROUP_RIGHT_SIDEBAR);

    // const elemFooter = <HTMLElement>document.querySelector('footer');
    // elemFooter.setAttribute('style', '');
  }

  // HALDLE OUTPUT 'GROUP CREATED' * CREATE GROUP RIGHT SIDEBAR *
  handleNewGroupCreatedFromSidebar(event) {
    console.log('DEPT EDIT-ADD - handleNewGroupCreatedFromSidebar ID GROUP ', event);
    if (event) {
      this.new_group_created_id = event
      this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = true

      this.NOT_HAS_EDITED = false

      this.getGroupsByProjectId();
      // this.HAS_COMPLETED_GET_GROUPS = true
      // console.log('DEPT EDIT-ADD - handleNewGroupCreatedFromSidebar tHAS_COMPLETED_GET_GROUPS  ', this.HAS_COMPLETED_GET_GROUPS );
    }
  }

  // -----------------------------------------------------------------------------
  // @ CREATE BOT RIGHT SIDEBAR --- IN SOSPESO
  // -----------------------------------------------------------------------------
  // OPEN * CREATE GROUP RIGHT SIDEBAR *
  openCreateBotRightSideBar() {

    // SCOLL TO TOP WHEN THE USER CLICK 'CREATE A NEW BOT'
    this.navbarbrandRef.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });

    this.OPEN_CREATE_BOT_RIGHT_SIDEBAR = true
    console.log('DEPT EDIT-ADD - OPEN CREATE BOT SIDEBAR ', this.OPEN_CREATE_BOT_RIGHT_SIDEBAR);

    const elemMainContent = <HTMLElement>document.querySelector('.main-content');
    this.train_bot_sidebar_height = elemMainContent.clientHeight + 10 + 'px'
    console.log('DEPT EDIT-ADD  - OPEN CREATE BOT SIDEBAR -> RIGHT SIDEBAR HEIGHT', this.train_bot_sidebar_height);
    // const _elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const elemFooter = <HTMLElement>document.querySelector('footer');
    elemFooter.setAttribute('style', 'display:none;');
    // _elemMainPanel.setAttribute('style', 'overflow-x: unset !important;');
  }


  // HALDLE OUTPUT 'CLOSE SIDEBAR' * CREATE BOT RIGHT SIDEBAR *
  handleCloseCreateBotSidebar(event) {
    this.OPEN_CREATE_BOT_RIGHT_SIDEBAR = event;
    console.log('DEPT EDIT-ADD - CLOSE CREATE BOT SIDEBAR ', this.OPEN_CREATE_BOT_RIGHT_SIDEBAR);
    const elemFooter = <HTMLElement>document.querySelector('footer');
    elemFooter.setAttribute('style', '');
  }





  getParamsAndDeptById() {
    this.id_dept = this.route.snapshot.params['deptid'];
    console.log('DEPT EDIT-ADD - DEPATMENT COMPONENT HAS PASSED id_DEPT ', this.id_dept);
    if (this.id_dept) {
      this.getDeptById();

      // TEST CHAT21-API-NODEJS router.get('/:departmentid/operators'
      /* GET OPERATORS OF A DEPT */
      // this.getDeptByIdToTestChat21AssigneesFunction()
    }

  }

  ngAfterViewInit() {
    // console.log('ngAfterViewInit  $(window)',  $(window)) 
    // console.log('ngAfterViewInit   $("#right_edit_card")',   $("#right_edit_card")) 
    // $(window).scroll(function(){
    //   console.log('ngAfterViewInit   $(window).scrollTop())',   $(window).scrollTop()) 
    //   $("#right_edit_card").stop().animate({"marginTop": ($(window).scrollTop()) + "px", "marginLeft":($(window).scrollLeft()) + "px"}, "slow" );
    // });



  }

  getStorageBucket() {
    const firebase_conf = this.appConfigService.getConfig().firebase;
    this.storageBucket = firebase_conf['storageBucket'];
    console.log('STORAGE-BUCKET (DEPT EDIT-ADD) ', this.storageBucket)
  }

  getUsersAndGroup() {
    this.getProjectUsers();
  }

  getProjectUsers() {
    this.usersService.getProjectUsersByProjectId().subscribe((projectUsers: any) => {
      console.log('DEPT EDIT-ADD - GET PROJECT USERS - RES ', projectUsers)

      if (projectUsers) {
        this.projectUsers = projectUsers;

      }
    }, error => {
      console.log('DEPT EDIT-ADD - GET PROJECT USERS - ERROR', error);
    }, () => {
      console.log('DEPT EDIT-ADD - GET PROJECT USERS - COMPLETE');

      this.getGroupsByProjectId();
    });
  }


  translateLabels() {
    this.translate.get('DeptsAddEditPage.NotificationMsgs')
      .subscribe((translation: any) => {
        // console.log('Depts Add Edit - translateNotificationMsgs text', translation)
        this.createSuccessMsg = translation.CreateDeptSuccess;
        this.createErrorMsg = translation.CreateDeptError;
        this.updateSuccessMsg = translation.UpdateDeptSuccess;
        this.updateErrorMsg = translation.UpdateDeptError;
      });

    this.translate.get('CanDeactivateModalText')
      .subscribe((translation: any) => {
        this.areYouSureMsg = translation.AreYouSure;
        this.youHaveUnsavedChangesMsg = translation.YouHaveUnsavedChanges;
        this.cancelMsg = translation.Cancel;
        this.areTouSureYouWantToNavigateAwayFromThisPageWithoutSaving = translation.AreTouSureYouWantToNavigateAwayFromThisPageWithoutSaving;

      });


    //       CanDeactivateModalText
    // AreYouSure
    // YouHaveUnsavedChanges
    // Cancel
  }

  // ============ NEW - SUBSTITUTES has_clicked_fixed ============
  has_clicked_bot(has_selected_bot: boolean) {
    console.log('HAS CLICKED BOT - SHOW DROPDOWN ', has_selected_bot);


    if (has_selected_bot === false) {
      this.BOT_NOT_SELECTED = true;
      console.log('DEPT EDIT-ADD - HAS CLICKED BOT - BOT NOT SELECTED ', this.BOT_NOT_SELECTED);


      this.selectedBotId = null;
      console.log('DEPT EDIT-ADD - SELECTED BOT ID ', this.selectedBotId)

      // ONLY BOT AUEOMATIC DESELECTION IF has_selected_bot IS FALSE
      this.has_selected_only_bot = false
      this.onlybot_disable_routing = false;
      this.bot_only = false;
    }
  }


  toggleActivateBot($event) {
    console.log('toggleActivateBot event', $event);
  }

  has_clicked_only_bot(has_selected_only_bot) {
    console.log('DEPT EDIT-ADD - HAS CLICKED ONLY BOT ', has_selected_only_bot);
    if (has_selected_only_bot === true) {
      this.onlybot_disable_routing = true;
      this.bot_only = true;
    } else {
      this.onlybot_disable_routing = false;
      this.bot_only = false;
    }
  }

  // WHEN THE USER EDITS A DEPTS CAN SELECT A BOT TO CORRELATE AT THE DEPARTMENT
  // WHEN THE BTN 'EDIT DEPARTMENT' IS PRESSED THE VALUE OF THE ID OF THE SELECTED BOT IS MODIFIED IN THE DEPT'S FIELD id_bot
  // Note: is used also for the 'CREATE VIEW'
  setSelectedBot(id: any): void {

    this.selectedBotId = id;
    console.log('FAQ-KB ID SELECTED (SUBSTITUTE BOT): ', this.selectedBotId);

    if (this.selectedBotId !== null) {
      this.NOT_HAS_EDITED = false
    }



    // IN THE CREATE VIEW IF IS NOT SELECTET ANY FAQ-KB (SUBSTITUTE BOT) THE BUTTON 'CREATE BOT' IS DISABLED
    if (this.selectedBotId !== 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = false;

      // Used to display bot info in right sidebar
      this.botId = this.selectedBotId
      this.getBotById()

    }
    if (this.selectedBotId === 'BOT_NOT_SELECTED') {
      this.BOT_NOT_SELECTED = true;
    }
  }

  /**
   * ======================= GETS ALL GROUPS WITH THE CURRENT PROJECT-ID =======================
   * USED TO POPULATE THE DROP-DOWN LIST 'GROUPS' ASSOCIATED TO THE ASSIGNED ANF POOLED ROUTING
   */
  getGroupsByProjectId() {

    if (this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR === true) {
      console.log('DEPT EDIT-ADD -  + + GET GROUPS  SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR', this.new_group_created_id);

      this.selectedGroupId = this.new_group_created_id;
    }
    // this.HAS_COMPLETED_GET_GROUPS = false
    this.groupService.getGroupsByProjectId().subscribe((groups: any) => {
      console.log('DEPT EDIT-ADD - GROUPS GET BY PROJECT ID', groups);

      if (groups) {
        this.groupsList = groups;

        console.log('DEPT EDIT-ADD - GROUP ID SELECTED', this.selectedGroupId);
        this.groupsList.forEach(group => {

          if (this.selectedGroupId) {
            if (group._id === this.selectedGroupId) {
              console.log('DEPT EDIT-ADD - GROUP ASSIGNED TO THIS DEPT', group);
              this.group_name = group.name
              this.projectUsersInGroup = [];

              group.members.forEach(member => {
                console.log('DEPT EDIT-ADD - MEMBER OF THE GROUP ASSIGNED TO THIS DEPT', member);

                this.projectUsers.forEach(projectuser => {
                  // console.log('DEPT EDIT-ADD - PROJECT USER ', projectuser);
                  if (member === projectuser.id_user._id) {

                    this.projectUsersInGroup.push(projectuser.id_user)
                  }
                });

              });

              console.log('DEPT EDIT-ADD - PROJECT USERS IN GROUP ', this.projectUsersInGroup);
              // const filteredProjectUsers = group.members
            }
          } else {
            console.log('DEPT EDIT-ADD - NO GROUP ASSIGNED TO THIS DEPT - GROUP ID', this.selectedGroupId);
          }
        });


        // CHECK IN THE GROUPS LIST THE GROUP-ID RETURNED FROM THE DEPT OBJECT.
        // IF THE GROUP-ID DOES NOT EXIST MEANS THAT WAS DELETED
        if (this.selectedGroupId !== null && this.selectedGroupId !== undefined) {
          this.checkGroupId(this.selectedGroupId, this.groupsList)
        }
      }
    },
      (error) => {
        console.log('DEPT EDIT-ADD + + GET GROUPS - ERROR ', error);
        // this.HAS_COMPLETED_GET_GROUPS = false
        // this.showSpinner = false;
      },
      () => {
        console.log('DEPT EDIT-ADD + + GET GROUPS * COMPLETE');
        // this.HAS_COMPLETED_GET_GROUPS = true
        //   this.new_group_created_id = event
        // this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = true

        // if (this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR === true) {
        //   console.log('DEPT EDIT-ADD -  + + GET GROUPS  SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR', this.new_group_created_id);

        //   this.selectedGroupId = this.new_group_created_id;
        // }

      });
  }

  checkGroupId(groupIdSelected, groups_list) {
    console.log('DEPT EDIT-ADD - checkGroupId: groupIdSelected', this.selectedGroupId, 'groups_list ', groups_list);
    this.GROUP_ID_NOT_EXIST = true;

    for (let i = 0; i < groups_list.length; i++) {
      const group_id = groups_list[i]._id;
      if (group_id === groupIdSelected) {
        this.GROUP_ID_NOT_EXIST = false;
        break;
      }
    }
    console.log('CHECK FOR GROUP ID - NOT EXIST?: ', this.GROUP_ID_NOT_EXIST)
    return this.GROUP_ID_NOT_EXIST;
  }

  setSelectedGroup(id: any): void {
    this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false;

    this.NOT_HAS_EDITED = false

    this.selectedGroupId = id;
    console.log('DEPT-EDIT-ADD - GROUP ID SELECTED: ', this.selectedGroupId);
    console.log('DEPT-EDIT-ADD - GROUP_ID_NOT_EXIST: ', this.GROUP_ID_NOT_EXIST);

    // this.SELECT_GROUP_CREATED_FROM_CREATE_GROUP_SIDEBAR = false;

    // IF THE GROUP ASSIGNED TO THE DEPT HAS BEEN DELETED,
    // this.GROUP_ID_NOT_EXIST IS SET TO TRUE - IN THIS USE-CASE IS SHOWED THE SELECT OPTION
    // 'GROUP ERROR' AND the CLASS errorGroup OF THE HTML TAG select IS SET TO TRUE
    // - IF THE USER SELECT ANOTHER OPTION this.GROUP_ID_NOT_EXIST IS SET TO false
    if (this.selectedGroupId !== 'Group error') {
      this.GROUP_ID_NOT_EXIST = false

      this.getGroupsByProjectId()
      console.log('DEPT EDIT-ADD - setSelectedGroup this.selectedGroupId !== Group error',);
    }

    // if (this.selectedGroupId !== 'ALL_USERS_SELECTED') {
    // }

    // SET TO null THE ID OF GROUP IF IS SELECTED 'ALL USER'
    if (this.selectedGroupId === 'ALL_USERS_SELECTED') {
      this.selectedGroupId = null;
    }
  }

  getCurrentProject() {
    this.auth.project_bs.subscribe((project) => {
      this.project = project
      // console.log('00 -> DEPT EDIT/ADD COMP project ID from AUTH service subscription  ', this.project._id)
    });
  }



  /**
   * GET THE FAQ-KB LIST FILTERING ALL THE FAQ-KB FOR THE CURRENT PROJECT ID
   * NOTE: THE CURRENT PROJECT ID IS OBTAINED IN THE FAQ-KB SERVICE
   * * USED IN THE OPTION ITEM FORM OF THE CREATE VIEW AND OF THE EDIT VIEW *
   */
  getFaqKbByProjecId() {
    this.faqKbService.getFaqKbByProjectId().subscribe((faqkb: any) => {
      console.log('GET FAQ-KB LIST - SUBSTITUTE BOT (TO SHOW IN SELECTION FIELD) ', faqkb);
      this.botsList = faqkb;

      // this.botsList.forEach(bot => {
      //   if (bot && bot.description) {
      //     let stripHere = 10;
      //     bot['truncated_desc'] = bot.description.substring(0, stripHere) + '...';
      //   }
      // });
    },
      (error) => {
        console.log('GET FAQ-KB LIST - SUBSTITUTE BOT - ERROR ', error);
      },
      () => {
        console.log('GET FAQ-KB LIST - SUBSTITUTE BOT - COMPLETE ');
      });

  }


  // GO BACK TO DEPARTMENTS COMPONENT
  goBackToDeptsList() {
    this.router.navigate(['project/' + this.project._id + '/departments']);
  }

  // goBack() {
  //   this.location.back();
  // }



  has_clicked_assigned(show_group_option_form: boolean, show_option_form: boolean, routing: string) {

    if (this.dept_routing !== 'assigned') {
      this.NOT_HAS_EDITED = false
    }

    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED ASSIGNABLE - SHOW GROUP OPTION ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'assigned'
  }

  // is the option (called Bot in the html) that provides for the selection of a faq-kb (also this called Bot in the html)
  // has_clicked_fixed(show_option_form: boolean, routing: string) {

  //   this.SHOW_OPTION_FORM = show_option_form;
  //   this.ROUTING_SELECTED = routing
  //   console.log('HAS CLICKED FIXED - SHOW OPTION ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)
  //   this.dept_routing = 'fixed'
  //   this.BOT_NOT_SELECTED = true;
  // }

  has_clicked_pooled(show_group_option_form: boolean, show_option_form: boolean, routing: string) {

    if (this.dept_routing !== 'pooled') {
      this.NOT_HAS_EDITED = false
    }
    this.SHOW_GROUP_OPTION_FORM = show_group_option_form;
    this.SHOW_OPTION_FORM = show_option_form;
    this.ROUTING_SELECTED = routing
    console.log('HAS CLICKED POOLED  - SHOW GROUP OPTION ', this.SHOW_GROUP_OPTION_FORM, ' SHOW BOT OPTION: ', this.SHOW_OPTION_FORM, ' ROUTING SELECTED ', this.ROUTING_SELECTED)

    // ONLY FOR THE EDIT VIEW (see above in ngOnInit the logic for the EDIT VIEW)
    this.dept_routing = 'pooled'

  }



  /** === FOR EDIT VIEW === **
   * **** GET DEPT (DETAILS) OBJECT BY ID AND (THEN) GET BOT OBJECT BY ID (GET BOT DETAILS) ***
   * THE ID USED TO RUN THIS getMongDbDeptById IS PASSED FROM THE DEPT LIST (DEPARTMENTS COMPONENT goToEditAddPage_EDIT))
   * FROM DEPT OBJECT IS USED:
   * THE DEPT NAME TO SHOW IN THE INPUT FIELD (OF THE EDIT VIEW)
   * THE DEPT ROUTING (PREVIOUSLY SELECTED): dept_routing is passed in the view [checked]="dept_routing === 'pooled'"
   * to determine the option selected
   * THE BOT ID (IT'S ACTUALLY THE FAQ-KB ID) TO RUN ANOTHER CALLBACK TO OBTAIN THE FAQ-KB OBJECT (SUBSTITUTE BOT) AND, FROM THIS,
   * THE FAQ-KB ID THAT IS USED TO OBTAIN (IN THE EDIT VIEW) THE FAQ-KB NAME AS OPTION PREVIOUSLY SELECTED
   * (WHEN THE USER HAS CREATED THE DEPT)  (see: selectedId === bot._id)
   */
  getDeptById() {
    this.mongodbDepartmentService.getMongDbDeptById(this.id_dept).subscribe((dept: any) => {
      console.log('DEPT-EDIT-ADD ++ > GET DEPT (DETAILS) BY ID - DEPT OBJECT: ', dept);
      if (dept) {
        this.IS_DEFAULT_DEPT = dept.default
        this.deptName_toUpdate = dept.name;
        this.dept_description_toUpdate = dept.description;
        this.botId = dept.id_bot;
        this.dept_routing = dept.routing;
        this.selectedGroupId = dept.id_group;
        this.dept_created_at = dept.createdAt;
        this.dept_ID = dept.id;
        this.bot_only = dept.bot_only

      }

      if (this.dept_routing === 'pooled') {
        this.SHOW_OPTION_FORM = false;
        this.dept_routing = 'pooled'
        this.BOT_NOT_SELECTED = true;

      } else if (this.dept_routing === 'assigned') {
        this.SHOW_OPTION_FORM = false;
        this.dept_routing = 'assigned'
        this.BOT_NOT_SELECTED = true;
      }
      // else if (this.dept_routing === 'fixed') {
      //   this.SHOW_OPTION_FORM = true;
      //   this.dept_routing = 'fixed'
      //   this.BOT_NOT_SELECTED = false;
      // }




      if (this.bot_only === false || this.bot_only === undefined || this.bot_only === null) {
        this.has_selected_only_bot = false;
      } else {
        this.has_selected_only_bot = true;
        this.onlybot_disable_routing = true;
      }

      console.log('++ DEPT DTLS - DEPT FULLNAME TO UPDATE: ', this.deptName_toUpdate);
      console.log('++ DEPT DTLS - DEPT DESCRIPTION TO UPDATE: ', this.dept_description_toUpdate);
      console.log('++ DEPT DTLS - BOT ID (IT IS ACTUALLY FAQ-KB ID) GET FROM DEPT OBJECT: ', this.botId);
      console.log('++ DEPT DTLS - ONLY BOT: ', this.bot_only);
      console.log('++ DEPT DTLS - DEPT ROUTING GET FROM DEPT OBJECT: ', this.dept_routing);
      console.log('++ DEPT DTLS - GROUP ID GET FROM DEPT OBJECT: ', this.selectedGroupId);


      // -------------------------------------------------------------------
      // Dept's avatar
      // -------------------------------------------------------------------
      let newInitials = '';
      let newFillColour = '';

      if (dept.name) {
        newInitials = avatarPlaceholder(dept.name);
        newFillColour = getColorBck(dept.name)
      } else {

        newInitials = 'n.a.';
        newFillColour = '#eeeeee';
      }

      this.dept_name_initial = newInitials;
      this.dept_name_fillcolour = newFillColour;
    },
      (error) => {
        console.log('GET DEPT BY ID - ERROR ', error);
        this.showSpinner = false;
      },
      () => {
        console.log('GET DEPT BY ID - COMPLETE ');

        this.showSpinner = false;


        if (this.botId === undefined) {

          this.selectedBotId = null;

          this.BOT_NOT_SELECTED = true;
          this.has_selected_bot = false;
          console.log('++ DEPT DTLS getDeptById has_selected_bot ', this.has_selected_bot);
          console.log('++ DEPT DTLS !!! BOT ID UNDEFINED ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);
          // this.showSpinner = false;
          // this.selectedValue = 'Selezione FAQ KB';

        } else if (this.botId == null) {

          this.selectedBotId = null;

          this.BOT_NOT_SELECTED = true;
          this.has_selected_bot = false;
          console.log('++ DEPT DTLS getDeptById has_selected_bot ', this.has_selected_bot);
          console.log(' !!! BOT ID NULL ', this.botId, ', BOT NOT SELECTED: ', this.BOT_NOT_SELECTED);
          // this.showSpinner = false;
        } else {
          // getBotById() IS RUNNED ONLY IF THE BOT-ID (returned in the DEPT OBJECT) 
          // IS NOT undefined AND IS NOT null

          // if the bot is defined it means that the user had selected the bot
          this.has_selected_bot = true
          this.BOT_NOT_SELECTED = false;

          this.getBotById();
          console.log(' !!! BOT ID DEFINED ', this.botId);
        }
      });

  }

  /** === FOR EDIT VIEW === **
   * **** GET FAQ-KB BY ID (SUBSTITUTE BOT) ***
   * THE ID OF THE BOT (IT'S ACTUALLY IS THE ID OF THE FAQ-KB) IS GET FROM THE DEPT OBJECT (CALLBACK getDeptById)
   * FROM THE FAQ-KB OBJECT (SUBSTITUTE BOT) IS USED:
   * THE FAQ-KB ID (SUBSTITUTE BOT) THAT IS USED TO OBTAIN THE FAQ-KB NAME SHOWED AS OPTION SELECTED IN THE EDIT VIEW
   * (see: selectedId === bot._id)
   */
  getBotById() {
    // this.botService.getMongDbBotById(this.botId).subscribe((bot: any) => { // NO MORE USED
    this.faqKbService.getMongDbFaqKbById(this.botId).subscribe((faqkb: any) => {
      console.log('GET FAQ-KB (DETAILS) BY ID (SUBSTITUTE BOT) ', faqkb);
      // this.selectedId = bot._id;

      if (faqkb) {
        this.selectedId = faqkb._id;
        this.bot_type = faqkb.type;
        // USED ONLY FOR DEBUG
        // this.selectedValue = bot.fullname;

        this.selectedValue = faqkb.name;
        if (faqkb.description) {
          this.bot_description = faqkb.description

          // --------------------------------------------------------------------------------
          // add btn read all if bot description text line are more of 2
          // --------------------------------------------------------------------------------   
          const elemSidebarDescription = <HTMLElement>document.querySelector('.sidebar-description');
          console.log(' DEPT EDIT-ADD elem Sidebar Description', elemSidebarDescription)



          let lines = undefined;
          if (this.bot_description) {
            if (elemSidebarDescription) {
              setTimeout(() => {

                const divHeight = elemSidebarDescription.offsetHeight
                const lineHeight = parseInt(elemSidebarDescription.style.lineHeight);
                console.log(' DEPT EDIT-ADD elem Sidebar Description divHeight', divHeight);
                console.log(' DEPT EDIT-ADD elem Sidebar Description lineHeight', lineHeight)


                if (divHeight && lineHeight) {
                  lines = divHeight / lineHeight;
                  console.log(' DEPT EDIT-ADD elem Sidebar Description lines', lines)
                }

                // const elemDescription = <HTMLElement>document.querySelector('.sidebar-description .description-icon-and-text .bot-description')
                // console.log(' DEPT EDIT-ADD elem Sidebar Description elemDescription', elemDescription)
                const textInDescription = elemSidebarDescription.textContent.replace(/(<.*?>)|\s+/g, (m, $1) => $1 ? $1 : ' ')
                console.log(' DEPT EDIT-ADD elem Sidebar Description elemDescription text', textInDescription)
                const lastThree = textInDescription.substr(textInDescription.length - 3);
                console.log(' DEPT EDIT-ADD elem Sidebar Description elemDescription text lastThree', lastThree)

                if (lines && lines > 3) {
                  console.log(' DEPT EDIT-ADD elem Sidebar Description lines is > 3', lines)
                  // elemSidebarDescription.setAttribute('style', ' display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;');
                  elemSidebarDescription.classList.add("sidebar-description-cropped");
                  this.display_btn_read_all_descr = true;
                  this.read_all = true;
                } else {
                  this.display_btn_read_all_descr = false
                }
              }, 300);
            }
          }
        } else {
          this.bot_description = 'n/a'
        }
      }

      // this.faqKbUrlToUpdate = faqKb.url;
      console.log('FAQ-KB NAME (SUBSTITUTE BOT) ', this.selectedValue);

    },
      (error) => {
        console.log('GET FAQ-KB BY ID (SUBSTITUTE BOT) - ERROR ', error);

        // this.showSpinner = false;
      },
      () => {
        console.log('GET FAQ-KB ID (SUBSTITUTE BOT) - COMPLETE ');
        // this.showSpinner = false;

      });

  }

  toggleDescriptionReadAll() {
    const elemSidebarDescription = <HTMLElement>document.querySelector('.sidebar-description');
    console.log('DEPT EDIT-ADD elem Sidebar Description toggleDescriptionReadAll', elemSidebarDescription)
    if (elemSidebarDescription.classList) {
      elemSidebarDescription.classList.toggle("sidebar-description-cropped");

      const hasClassCropped = elemSidebarDescription.classList.contains("sidebar-description-cropped")
      console.log('DEPT EDIT-ADD elem Sidebar Description toggleDescriptionReadAll hasClassCropped', hasClassCropped)
      if (hasClassCropped === false) {
        this.read_all = false;
      } else {
        this.read_all = true;
      }

    } else {
      // For IE9
      var classes = elemSidebarDescription.className.split(" ");
      var i = classes.indexOf("sidebar-description-cropped");

      if (i >= 0)
        classes.splice(i, 1);
      else
        classes.push("sidebar-description-cropped");
      elemSidebarDescription.className = classes.join(" ");
    }
  }


  goToBotDetails() {
    let botType = ''
    if (this.bot_type === 'internal') {
      botType = 'native'
    } else {
      botType = this.bot_type
    }

    this.router.navigate(['project/' + this.project._id + '/bots', this.selectedId, botType]);
  }

  goToMemberProfile(memberid) {
    this.getProjectuserbyUseridAndGoToEditProjectuser(memberid)
  }

  goToEditGroup() {
    this.router.navigate(['project/' + this.project._id + '/group/edit/' + this.selectedGroupId]);
  }

  getProjectuserbyUseridAndGoToEditProjectuser(member_id: string) {

    this.usersService.getProjectUserByUserId(member_id).subscribe((projectUser: any) => {
      console.log('DEPT EDIT-ADD GET projectUser by USER-ID ', projectUser)
      if (projectUser) {
        console.log('DEPT EDIT-ADD - ADDprojectUser id', projectUser[0]._id);

        this.router.navigate(['project/' + this.project._id + '/user/edit/' + projectUser[0]._id]);
      }
    }, (error) => {
      console.log('DEPT EDIT-ADD GET projectUser by USER-ID - ERROR ', error);
    }, () => {
      console.log('DEPT EDIT-ADD GET projectUser by USER-ID * COMPLETE *');
    });
  }

  /**
 * ADD DEPARMENT
 *       this.dept_name,
    this.dept_description,
 */
  createDepartment() {
    this.NOT_HAS_EDITED = true;
    console.log('DEPT EDIT-ADD createDepartment DEPT NAME  ', this.deptName_toUpdate);
    console.log('DEPT EDIT-ADD createDepartment DEPT DESCRIPTION DIGIT BY USER ', this.dept_description_toUpdate);
    console.log('DEPT EDIT-ADD createDepartment GROUP ID WHEN CREATE IS PRESSED ', this.selectedGroupId);
    this.mongodbDepartmentService.addDept(
      this.deptName_toUpdate,
      this.dept_description_toUpdate,
      this.selectedBotId,
      this.bot_only,
      this.selectedGroupId,
      this.ROUTING_SELECTED).subscribe((department) => {
        console.log('DEPT EDIT-ADD +++ ++++ POST DATA DEPT', department);
      },
        (error) => {
          console.log('DEPT EDIT-ADD createDepartment ERROR ', error);
          this.notify.showWidgetStyleUpdateNotification(this.createErrorMsg, 4, 'report_problem');
        },
        () => {
          this.notify.showWidgetStyleUpdateNotification(this.createSuccessMsg, 2, 'done');
          console.log('DEPT EDIT-ADD createDepartment * COMPLETE *');
          this.router.navigate(['project/' + this.project._id + '/departments']);

        });
  }


  edit() {
    this.NOT_HAS_EDITED = true;
    console.log('DEPT EDIT-ADD - EDIT - ID WHEN EDIT IS PRESSED ', this.id_dept);
    console.log('DEPT EDIT-ADD - EDIT - FULL-NAME WHEN EDIT IS PRESSED ', this.deptName_toUpdate);
    console.log('DEPT EDIT-ADD - EDIT - DESCRIPTION WHEN EDIT IS PRESSED ', this.dept_description_toUpdate);
    console.log('DEPT EDIT-ADD - EDIT - BOT ID WHEN EDIT IS PRESSED IF USER HAS SELECT ANOTHER BOT', this.selectedBotId);
    console.log('DEPT EDIT-ADD - EDIT - BOT ID WHEN EDIT IS PRESSED IF USER ! DOES NOT SELECT A ANOTHER BOT', this.botId);
    console.log('DEPT EDIT-ADD - EDIT - DEPT_ROUTING WHEN EDIT IS PRESSED ', this.dept_routing);
    console.log('DEPT EDIT-ADD - EDIT - ROUTING_SELECTED WHEN EDIT IS PRESSED ', this.ROUTING_SELECTED);

    // selectedFaqKbId
    // 'FIXED' (NOW, IN THE HTML, RENAMED IN 'BOT') OPTION WORK-FLOW:
    // IF THE USER, WHEN EDIT THE DEPT (AND HAS SELECTED FIXED), DOESN'T SELECT ANY NEW BOT this.selectedBotId IS UNDEFINED
    // SO SET this.botIdEdit EQUAL TO THE BOT ID RETURNED BY getBotById
    // if (this.ROUTING_SELECTED === 'fixed') {

    // if (this.dept_routing === 'fixed') {
    if (this.selectedBotId === undefined) {
      this.botIdEdit = this.botId
    } else {
      this.botIdEdit = this.selectedBotId
    }


    // this.faqKbEdit
    // this.ROUTING_SELECTED
    this.mongodbDepartmentService.updateDept(this.id_dept,
      this.deptName_toUpdate,
      this.dept_description_toUpdate,
      this.botIdEdit,
      this.bot_only,
      this.selectedGroupId,
      this.dept_routing).subscribe((data) => {
        console.log('DEPT EDIT-ADD - EDIT - RES ', data);

        // RE-RUN GET CONTACT TO UPDATE THE TABLE
        // this.getDepartments();
        // this.ngOnInit();
      },
        (error) => {
          console.log('DEPT EDIT-ADD - EDIT - ERROR ', error);

          this.notify.showWidgetStyleUpdateNotification(this.updateErrorMsg, 4, 'report_problem');

        },
        () => {
          console.log('DEPT EDIT-ADD - EDIT * COMPLETE *');
          this.notify.showWidgetStyleUpdateNotification(this.updateSuccessMsg, 2, 'done');

          // this.router.navigate(['project/' + this.project._id + '/departments']);
        });

  }

  goTo_BotEditAddPage_CREATE() {
    this.router.navigate(['project/' + this.project._id + '/bots/bot-select-type']);
  }

  // TEST CHAT21-API-NODEJS router.get('/:departmentid/operators'
  /* GET OPERATORS OF A DEPT */
  getDeptByIdToTestChat21AssigneesFunction() {
    this.mongodbDepartmentService.testChat21AssignesFunction(this.id_dept).subscribe((dept: any) => {
      console.log('-- -- -- TEST func - RESULT: ', dept);
    },
      (error) => {
        console.log('-- -- -- TEST func - ERROR ', error);
        // this.showSpinner = false;
      },
      () => {
        console.log('-- -- --TEST func * COMPLETE *');
      });
  }



}
