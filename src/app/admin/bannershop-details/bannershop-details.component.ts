import {
    Component,
    OnInit,
    ViewChild
} from '@angular/core';

import { Restangular } from 'ngx-restangular';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../environments/environment';
import { AdminResourceComponent } from '../resource/resource.component';
import * as moment from 'moment';

@Component({
    selector: 'app-admin-banner',
    templateUrl: './bannershop-details.component.html',
    styleUrls: ['./bannershop-details.component.scss']
})
export class AdminBannerShopDetailsComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;

    public message: string;
    public categories: any;
    public env: any;
    public form: any;
    public bannerId: any;
    public banner: any;
    public required_upload_file_url: boolean;
    public imageChangedEvent: any;
    public imageBase64: any;

    constructor(
        private api: Restangular,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService
    ) { }

    ngOnInit() {
        this.env = environment;

        this.activeRoute.params.forEach((params: Params) => {
            this.bannerId = params['id'];
        });

        this.required_upload_file_url = false;

        this.banner = {
            is_youtube: false
        };

        this.form = new FormGroup({
            type: new FormControl(this.banner.type, []),
            target_url: new FormControl(this.banner.target_url, []),
            order: new FormControl(this.banner.order, []),
            category_id: new FormControl(this.banner.category_id, []),
            target_type: new FormControl(this.banner.target_url, []),
        });

        if (this.bannerId) {
            this.getBanner();
        }
    }

    getBanner() {
        this.api
            .one('bannershop', this.bannerId)
            .get()
            .subscribe(res => {
                this.banner = res.result;
            });
    }


    save() {
        if (!this.resource.isChanged) {
            this.onSave();
        } else {
            this.resource.onSave((response) => {
                const name = response.name.split('.');
                const originalName = name[0] + '_ORIGINAL.' + name[1];
                this.banner.url = response.url + '/' + originalName;
                this.onSave();
            });
        }
    }

    onSave() {
        if (this.bannerId) {
            this.api
                .one('bannershop', this.bannerId)
                .customPUT(this.banner)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Update banner successfully');
                        this.router.navigate(['/admin/bannershop']);
                    }
                });
        } else {
            this.api
                .all('bannershop')
                .customPOST(this.banner)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success('Add banner successfully');
                        this.router.navigate(['/admin/bannershop']);
                    }
                });
        }
    }
}
