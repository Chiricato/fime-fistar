import {Component, Inject, OnInit} from '@angular/core';
import {Restangular} from 'ngx-restangular';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../environments/environment';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
    selector: 'app-admin-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class AdminUserDetailComponent implements OnInit {
    public env: any;
    public user_no: any;
    public user: any;
    public form: any;
    public roles: any;
    public permission: any;
    public cities: any;
    public streets: any;
    public states: any;
    public wards: any;
    public city_name = "";
    public state_name = "";
    public ward_name = "";
    public street_name = "";
    public isSaving = false;
    public submitted;

    constructor(
        private api: Restangular,
        public activeRoute: ActivatedRoute,
        private router: Router,
        private toast: ToastrService) {
    }

    ngOnInit() {
        this.env = environment;
        this.activeRoute.params.forEach((params: Params) => {
            this.user_no = params['id'];
        });
        this.submitted = false;
        this.user = {};
        this.user.permission = {};
        this.form = new FormGroup({
            user_no: new FormControl({value: this.user.user_no, disabled: true}, []),
            reg_name: new FormControl(this.user.reg_name, [Validators.required]),
            email: new FormControl(this.user.email, [Validators.required]),
            id: new FormControl(this.user.id, [Validators.required]),
            cellphone: new FormControl(this.user.cellphone, [Validators.required]),
            home_addr1: new FormControl(this.user.home_addr1, [Validators.required]),
            active: new FormControl(this.user.active, [Validators.required]),
            password: new FormControl(this.user.password, []),
            allow_comment: new FormControl(this.user.allow_comment, [Validators.required]),
            allow_review: new FormControl(this.user.allow_review, [Validators.required]),
            delete: new FormControl(this.user.delete, []),
            userRole: new FormControl(this.user.role_id, []),
            category: new FormControl(this.user.permission.category, []),
            catalog: new FormControl(this.user.permission.catalog, []),
            tryfree: new FormControl(this.user.permission.tryfree, []),
            review: new FormControl(this.user.permission.review, []),
            banner_slide: new FormControl(this.user.permission.banner_slide, []),
            banner_shop: new FormControl(this.user.permission.banner_shop, []),
            tip: new FormControl(this.user.permission.tip, []),
            product_brand: new FormControl(this.user.permission.product_brand, []),
            notifi: new FormControl(this.user.permission.notifi, []),
            faq: new FormControl(this.user.permission.faq, []),
            blog: new FormControl(this.user.permission.blog, []),
            point: new FormControl(this.user.permission.point, []),
            event: new FormControl(this.user.permission.event, []),
            voucher: new FormControl(this.user.permission.voucher, []),
            user: new FormControl(this.user.permission.user, []),
            hot_fime: new FormControl(this.user.permission.hot_fime, []),
            hashtag: new FormControl(this.user.permission.hashtag, []),
            setting: new FormControl(this.user.permission.setting, []),
            fistar: new FormControl(this.user.permission.fistar, []),
            street: new FormControl(this.user.permission.street, []),
            facebook_url: new FormControl(this.user.facebook_url, []),
            youtube_url: new FormControl(this.user.youtube_url, []),
            instagram_url: new FormControl(this.user.instagram_url, []),
            tiktok_url: new FormControl(this.user.tiktok_url, []),
            street_id: new FormControl(this.user.street_id, [Validators.required]),
            city_id: new FormControl(this.user.city_id, [Validators.required]),
            district_id: new FormControl(this.user.district_id, [Validators.required]),
            ward_id: new FormControl(this.user.ward_id, [Validators.required]),
        });
        if (this.user_no) {
            this.getUser();
        }
        this.getCities();
        this.getStreet();
        this.getRoles();
    }

    getUser() {
        this.api
            .one('admin/user/get', this.user_no)
            .get()
            .subscribe(res => {
                this.user = res.result;
                this.user.deleted = this.user.delete_at === 'N' ? 0 : 1;
                this.user.active = this.user.drmncy_at === 'N' ? 1 : 0;
                if(this.user.city_id){
                    this.api.all('state/'+this.user.city_id).customGET('').subscribe(res => {
                        this.states = res.result;
                    });
                }else{
                    this.states = [];
                }

                if(this.user.district_id){
                    this.api.all('ward/'+this.user.district_id).customGET('').subscribe(res => {
                        this.wards = res.result;
                    });
                }else{
                    this.wards = [];
                }
            });
    }

    getCities() {
        this.api.all('city').customGET('').subscribe(res => {
            this.cities = res.result;
        });
    }

    changeCity(event) {
        this.city_name = event.name;
        if(this.user.city_id){
            this.api.all('state/'+this.user.city_id).customGET('').subscribe(res => {
                this.states = res.result;
            });
        }else{
            this.states = [];
        }
        this.user.district_id = '';
        this.user.ward_id = '';
        
    }
    changeWard(event) {
        this.ward_name = event.name;
        
    }
    changeStreet(event) {
        this.street_name = event.name;
        
    }
    changeDistrict(event) {
        this.state_name = event.name;
        if(this.user.district_id){
            this.api.all('ward/'+this.user.district_id).customGET('').subscribe(res => {
                this.wards = res.result;
            });
        }else{
            this.wards = [];
        }
        this.user.ward_id = '';
    }
    getStreet() {
        this.api.all('street').customGET('').subscribe(res => {
            this.streets = res.result;
        });
    }

    save() {
        console.log(this.isSaving,'this.isSaving');
        console.log(this.form,'this.form');
        this.submitted = true;
        if (this.isSaving) {
            return;
        }
        if (this.form.valid) {
            this.isSaving = true;
            if (this.user_no) {
                this.api.all('admin/user/' + this.user.user_no + '/update').customPOST(this.user).subscribe(res => {
                    if (res.result) {
                        if(res.result.error){
                            this.toast.error('Have error. '+ res.result.message);
                        }else{
                            this.toast.success('Update user successfully');
                        }
                        
                        // this.router.navigate(['/admin/user-management']);
                    }
                });
            } else {
                this.api.all('admin/user/add').customPOST(this.user).subscribe(res => {
                    if (res.result) {
                        if(res.result.error){
                            this.toast.error('Have error. '+ res.result.message);
                        }else{
                            this.toast.success('Add user successfully');
                            this.user = res.result;
                            this.user.deleted = this.user.delete_at === 'N' ? 0 : 1;
                            this.user.active = this.user.drmncy_at === 'N' ? 1 : 0;
                            this.user_no = this.user.user_no;
                        }
                        
                    }
                });
            }
        }
    }

    getRoles() {
        this.api.all('admin/roles/get-list').customGET().subscribe(res => {
            this.roles = res.result;
        });
    }
}
