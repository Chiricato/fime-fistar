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
    selector: 'app-admin-event',
    templateUrl: './point-event-add.component.html',
    styleUrls: ['./point-event-add.component.scss']
})
export class AdminPointEventAddComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    @ViewChild('winnerImage') public winnerImage: AdminMultipleImagesComponent;
    @ViewChild('resourceImgDesc') public resourceImgDesc: AdminMultipleImagesComponent;

    public message: string;
    public categories: any;
    public env: any;
    public form: any;
    public eventId: any;
    public event: any;
    public brands = [];
    public eventEventTypes = [
        {value: 1, viewValue: 'Join'},
        {value: 2, viewValue: 'Answer'}
    ];
    public timeColorCodes: any;
    public eventEventTypeSelected = 'review';
    public invalidMainImage = false;
    public invalidImages = false;
    public isSubmitted = false;
    public output_text_type = '1';
    public output_category = '407';
    public fashion: any;
    public points: [];
    public readonly = false;
    public point_policy: any;

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

        this.activeRoute.params.forEach((params: Params) => {
            this.eventId = params['id'];
        });
        this.timeColorCodes = [];
        this.points = [];
        this.event = {
            content: '',
            resource_type: 1,
            level_1: 1,
            level_2: 1,
            level_3: 1,
            level_4: 1,
            status: 1,
            max_winner: 0,
            add_point: 0,
            minus_point: 0,
            type: 1,
            max_point: 0,
            payment_method: 1
        };

        this.form = new FormGroup({
            title: new FormControl(this.event.title, [Validators.required]),
            status: new FormControl(this.event.status, [Validators.required]),
            point_policy_id: new FormControl(this.event.point_policy_id, []),
            level_1: new FormControl({value:this.event.level_1,disabled: this.readonly}, []),
            level_2: new FormControl({value:this.event.level_2,disabled: this.readonly}, []),
            level_3: new FormControl({value:this.event.level_3,disabled: this.readonly}, []),
            level_4: new FormControl({value:this.event.level_4,disabled: this.readonly}, []),
            add_point: new FormControl(this.event.add_point, []),
            minus_point: new FormControl(this.event.minus_point, []),
            payment_method: new FormControl(this.event.payment_method),
            start_date: new FormControl(this.event.event_bgnde, [Validators.required]),
            end_date: new FormControl(this.event.event_endde, [Validators.required]),
            max_winner: new FormControl(this.event.max_winner, []),
            type: new FormControl(this.event.type, [Validators.required]),
            content: new FormControl(this.event.content, []),
            comment_field: new FormControl(this.event.comment_field, [])
        });

        if (this.eventId) {
            this.getEvent();
        }
        this.getPointPolicy();
    }

    getEvent() {
        this.api.one('find-event', this.eventId).get()
            .subscribe(res => {
                this.event = res.result;
                if (res.result.banner) {
                    this.event.banner_image = res.result.banner.name ? res.result.banner.url + '/' +
                        res.result.banner.name : null;
                } else {
                    this.event.banner_image = null;
                }
                if(this.event.status == 3){
                    this.event.status = 1;
                }
                this.point_policy = this.event.point_policy;
                console.log(this.event);
            });
    }

    getPointPolicy() {

        this.api.all('point-policy').customGET('',
            {
                column: 'id', sort: 'desc',
                enable: true,
                all: true
            }).subscribe(res => {
            this.points = res.result
        });
    }
    onChangePoint(){
        if(this.point_policy){
            this.readonly = true;
            this.event.add_point = this.point_policy.add_point;
            this.event.minus_point = this.point_policy.minus_point;
            this.event.level_1 = this.point_policy.level_1;
            this.event.level_2 = this.point_policy.level_2;
            this.event.level_3 = this.point_policy.level_3;
            this.event.level_4 = this.point_policy.level_4;
            this.event.point_policy_id = this.point_policy.id;
            this.event.max_point = this.point_policy.max_point;
        }else{
            this.readonly = false;
            this.event.add_point = 0;
            this.event.minus_point = 0;
            this.event.level_1 = 1;
            this.event.level_2 = 1;
            this.event.level_3 = 1;
            this.event.level_4 = 1;
            this.event.point_policy_id = 0;
            this.event.max_point = 0;
        }
        
        
    }

    onSave() {
        this.isSubmitted = true;

        this.resourceImgDesc.onSave((res) => {
            if (typeof res !== 'undefined') {
                if (res.images) {
                    this.event.img_desc = res.images;
                } else {
                    this.event.img_desc = null;
                }
            }

            this.resource.onSave((response) => {
                if (typeof response === 'undefined' || typeof response.url === 'undefined' || !response.url) {
                    this.invalidMainImage = true;
                    return;
                }
                this.event.banner = response;
                this.winnerImage.onSave((rs) => {
                    this.event.winnerImage = rs.images;
                    console.log(this.event,'this.event');
                    this.onSaveCallback();
                });
            });
        });
    }

    onSaveCallback() {
        this.event.start_date = moment(this.event.start_date).format('YYYY-MM-DD');
        this.event.end_date = moment(this.event.end_date).format('YYYY-MM-DD');
        console.log(this.event);
        if (this.eventId) {
            this.api
                .one('update-event', this.eventId)
                .customPUT(this.event)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update event successfully');
                        this.router.navigate(['/admin/event']);
                    }
                });
        } else {
            this.api
                .all('add-event')
                .customPOST(this.event)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add event successfully');
                        this.router.navigate(['/admin/event']);
                    }
                });
        }
    }

    goBack(): void {
        this.router.navigate(['/admin/event']);
    }

}
