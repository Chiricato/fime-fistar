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
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import * as moment from 'moment';

@Component({
    selector: 'app-admin-point',
    templateUrl: './point-details.component.html',
    styleUrls: ['./point-details.component.scss']
})
export class AdminPointDetailsComponent implements OnInit {

    public message: string;
    public env: any;
    public form: any;
    public pointId: any;
    public point: any;
    public isSubmitted = false;
    public minDate: Date;

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
            this.pointId = params['id'];
        });
        this.point = {
            note: '',
            status: 1,
            level_1: false,
            level_2: false,
            level_3: false,
            level_4: false,
            point_expried: 0,
            add_point: 0,
            max_point: 0,
            minus_point: 0,
            limit_apply: 0
        };
        this.minDate = new Date();
        this.form = new FormGroup({
            name: new FormControl(this.point.name, [Validators.required]),
            note: new FormControl(this.point.note, []),
            level_1: new FormControl(this.point.level_1, []),
            level_2: new FormControl(this.point.level_2, []),
            level_3: new FormControl(this.point.level_3, []),
            level_4: new FormControl(this.point.level_4, []),
            start_date: new FormControl(this.point.start_date),
            end_date: new FormControl(this.point.end_date),
            add_point: new FormControl(this.point.add_point),
            max_point: new FormControl(this.point.max_point, []),
            minus_point: new FormControl(this.point.minus_point, []),
            limit_apply: new FormControl(this.point.limit_apply, []),
            point_expried: new FormControl(this.point.point_expried, []),
            status: new FormControl(this.point.status, [Validators.required]),
        });

        if (this.pointId) {
            this.getPoint();
        }
    }

    getPoint() {
        this.api.one('find-point', this.pointId).get()
            .subscribe(res => {
                this.point = res.result;
                console.log(this.point);
                console.log(this.point.log);
                this.point.start_date = moment(this.point.start_date).format('YYYY-MM-DD');
                this.point.end_date = moment(this.point.end_date).format('YYYY-MM-DD');
            });
    }

    onSave() {
        this.isSubmitted = true;
        if(this.point.name == ''){
            this.form.controls.name.errors.required = true;
            return false;
        }
        if(this.point.start_date != undefined){
            this.point.start_date = moment(this.point.start_date).format('YYYY-MM-DD');
        }else{
            this.point.start_date = '';
        }
        if(this.point.end_date != undefined){
            this.point.end_date = moment(this.point.end_date).format('YYYY-MM-DD');
        }else{
            this.point.end_date = '';
        }
        

        if (this.pointId) {
            this.api
                .one('point-policy', this.pointId)
                .customPUT(this.point)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update point policy successfully');
                        this.router.navigate(['/admin/point-policy']);
                    }
                });
        } else {
            this.api
                .all('point-policy')
                .customPOST(this.point)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add point policy successfully');
                        this.router.navigate(['/admin/point-policy']);
                    }
                });
        }
    }

    goBack(): void {
        this.router.navigate(['/admin/point-policy']);
    }
    onChange(){
        if(this.point.start_date != undefined && this.point.end_date != undefined){
            const start_date =  moment(this.point.start_date);
            const end_date =  moment(this.point.end_date);
            this.point.point_expried = end_date.diff(start_date, 'days')+1;
        }else{
            this.point.point_expried = 0;
        }
    }

}
