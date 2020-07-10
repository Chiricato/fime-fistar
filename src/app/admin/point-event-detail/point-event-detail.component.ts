import {
    Component,
    OnInit,
    Inject,
    PLATFORM_ID,
    ViewChild
} from '@angular/core';

import {Restangular} from 'ngx-restangular';
import {Router, ActivatedRoute, Params} from '@angular/router';
import {FormGroup, FormControl, Validators, FormArray} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {TranslateService} from '@ngx-translate/core';
import * as _ from 'lodash';

import {CookieService} from '../../../services/cookie.service';
import {environment} from '../../../environments/environment';
import {AdminResourceComponent} from '../resource/resource.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import * as moment from 'moment';
import {AdminMultipleImagesComponent} from '../multiple-images/multiple-images.component';

@Component({
    selector: 'app-admin-try',
    templateUrl: './point-event-detail.component.html',
    styleUrls: ['./point-event-detail.component.scss']
})
export class AdminPointEventDetailsComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    @ViewChild('resourceImgDesc') public resourceImgDesc: AdminMultipleImagesComponent;
    @ViewChild('images') public images: AdminMultipleImagesComponent;

    public message: string;
    public env: any;
    public eventId: any;
    public events: any;
    public event_apply: any;
    public pageLimitOptions = [];
    public pageIndex = 1;
    public pageSize = 20;
    public selected = [];
    public total = 0;
    public column = 'id';
    public sort = 'desc';
    public type_rand = 1;
    public number_rand = 0;
    public remain_winner = 0;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private api: Restangular,
        private cookieService: CookieService,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService,
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
    }

    ngOnInit() {
        this.env = environment;
        this.pageLimitOptions = [
            {value: 5},
            {value: 10},
            {value: 20},
            {value: 25},
            {value: 50}
        ];
        this.activeRoute.params.forEach((params: Params) => {
            this.eventId = params['id'];
        });
        this.event_apply = [];
        this.events = {
            payment_method: 1,
            type: 1,
            views: 0,
            member: 0,
            comment: 0,
            current_winner: 0,
            max_winner: 0
        };
        console.log('events',this.events);
        this.getEvent();
        this.getEventApply();
    }
    getEvent() {
        this.api.one('find-event', this.eventId).get()
            .subscribe(res => {
                this.events = res.result;
                this.remain_winner = this.events.max_winner - this.events.current_winner
                console.log('events',this.events);
            });
        
    }

    getEventApply() {
        this.api.one('event-apply', this.eventId).customGET('',{
            page: this.pageIndex, pageSize: this.pageSize,
            column: this.column, sort: this.sort
        }).subscribe(res => {
            this.event_apply = res.result.data;
            this.total = res.result.total;
            console.log(this.event_apply);
        });
    }

    changePageLimit(limit: any): void {
        this.pageSize = limit;
        this.getEventApply();
    }

    setPage(pageInfo) {
        this.pageIndex = pageInfo.offset + 1;
        this.getEventApply();
    }
    onSort(event) {
        this.column = event.sorts[0].prop;
        this.sort = event.sorts[0].dir;
        this.pageIndex = 1;
        this.getEventApply();
        return false;
    }

    onSelect({selected}) {
        this.selected.splice(0, this.selected.length);
        this.selected.push(...selected);
    }
    onChange() {
        console.log(this.selected);
        if(this.type_rand == 1){
            if (this.selected.length <= 0) {
                this.toast.error('Please choose item');
                return false;
            }else{
                if(this.selected.length > this.remain_winner){
                    this.toast.error('Count is not over remain winner');
                    return false;
                }
                const ids = _.map(this.selected, 'id');

                this.api.all('winner_apply').customPOST({ids: ids,event_id:this.events.id}).subscribe(res => {
                    if (res.result) {
                        this.pageIndex = 1;
                        this.getEvent();
                        this.getEventApply();
                        this.toast.success('The user has been winner');
                    }
                });
            }
        }else{
            if(this.number_rand > this.remain_winner){
                this.toast.error('Count is not over remain winner');
                return false;
            }else{
                this.api.all('winner_random').customPOST({number_rand: this.number_rand,event_id:this.events.id}).subscribe(res => {
                    if (res.result) {
                        this.pageIndex = 1;
                        this.getEvent();
                        this.getEventApply();
                        this.toast.success('The user has been winner');
                    }
                });
            }
        }
    }
    goBack(): void {
        this.router.navigate(['/admin/event']);
    }

}
