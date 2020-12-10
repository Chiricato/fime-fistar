import {
  Component,
  OnInit,
  Inject,
  PLATFORM_ID,
  ViewChild
} from '@angular/core';

import { Restangular } from 'ngx-restangular';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AngularFileUploaderComponent } from 'angular-file-uploader';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

import { CookieService } from '../../../services/cookie.service';
import { environment } from '../../../environments/environment';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AdminMultipleImagesCustomComponent } from '../multiple-images/multiple-images-custom.component';
import { ReviewService } from '../../../services/review.service';
import { ImageBase64 } from '../multiple-images/multiple-images.component';
import { FileUploader } from 'ng2-file-upload';
const URL_UL = environment.host + '/uploads';

@Component({
  selector: 'app-admin-review-edit',
  templateUrl: './review-edit.component.html',
  styleUrls: ['./review-edit.component.scss']
})
export class AdminReviewEditComponent implements OnInit {
  @ViewChild('images') public images: AdminMultipleImagesCustomComponent;

  public env: any;
  public reviewID: any;
  public categories: [];
  public review: any;
  public isSaving = false;
  public isHaveImage = false;
  public submitted = false;
  public isLoading = true;
  public reviewForm: any;
  public slug;
  private idFormat = '[0-9]+';
  public brands: any;
  public beauty: any;
  public fashion: any;
  public food: any;
  public life_style: any;
  public other: any;
  public imagesBase64: ImageBase64[] = [];
  public arr_display_video = [0, 1, 2, 3, 4];
  public uploader: FileUploader = new FileUploader({
      url: URL_UL,
      itemAlias: 'video_review',
      maxFileSize: 200 * 1024 * 1024
  });


  constructor(
    private api: Restangular,
    private cookieService: CookieService,
    private router: Router,
    public activeRoute: ActivatedRoute,
    private toast: ToastrService,
    private reviewService: ReviewService,
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.review = {
      // name: '',
      // description: '',
      goods_cl_code: '',
      videoFiles: []
    };

    this.env = environment;
    this.slug = this.activeRoute.snapshot.paramMap.get('slug');
    if (this.slug) {
      this.reviewService.getReviewDetail(this.slug);
      this.reviewService.reviewObser.subscribe(res => {
        this.isLoading = false;
        if (res) {
          this.review = res;
        } else {
          this.router.navigate(['/']);
        }
      });
    }
    this.activeRoute.params.forEach((params: Params) => {
      this.reviewID = params['id'];
    });
    this.reviewForm = new FormGroup({
      name: new FormControl(this.review.goods_nm, Validators.required),
      category_id: new FormControl(this.review.goods_cl_code, [Validators.required, Validators.pattern(this.idFormat)]),
      brand_id: new FormControl(this.review.goods_cl_code_brand, [Validators.required, Validators.pattern(this.idFormat)]),
      short_description: new FormControl(this.review.review_short, [Validators.required]),
      description: new FormControl(this.review.review_dc, [Validators.required]),
      reviews_code_group: new FormControl(this.review.reviews_code_group, [Validators.required]),
      hash_tag: new FormControl(this.review.hash_tag, [Validators.required])
    });

    this.getReview();
    this.getCategories();
    this.getBrands();
    this.getFashion();
    this.getFood();
    // this.getOther();
    // this.getLifeStyle();
  }
  get form() {
    return this.reviewForm.controls;
  }

  hasError(form, formValue): boolean {
    if (form && formValue && formValue.errors && formValue.touched) {
      return true;
    }
    return false;
  }

  getCategories() {
    this.api.all('categories').customGET().subscribe(res => {
      this.isLoading = false;
      if (res.result) {
        this.categories = res.result;
      }
    });
  }

  getFashion() {
      this.api.all('getFashion').customGET().subscribe(res => {
          this.isLoading = false;
          if (res.result) {
              this.fashion = res.result;
          }
      });
  }
  getFood() {
      this.api.all('getFood').customGET().subscribe(res => {
          this.isLoading = false;
          if (res.result) {
              this.food = res.result;
          }
      });
  }
  // getOther() {
  //     this.api.all('getOther').customGET('').subscribe(res => {
  //         this.other = res.result;
  //     });
  // }
  // getLifeStyle() {
  //     this.api.all('getLifeStyle').customGET('').subscribe(res => {
  //         this.life_style = res.result;
  //     });
  // }

  getBrands() {
      this.api.all('brands/getAll').customGET('').subscribe(res => {
          this.isLoading = false;
          if (res.result) {
              this.brands = res.result;
          }
      });
  }

  getReview() {
    this.api.one('reviews', this.reviewID)
      .get()
      .subscribe(res => {
        if (res.result) {
          this.review = res.result;
          this.review.videoFiles = [];
          var item_video = {};
          for (let i = 0; i < this.review.files.length; i++) {
              if (this.review.files[i].TYPE_FILE == 2) {
                  item_video = {
                      name: this.review.files[i].ORGINL_FILE_NM,
                      thumb_name: this.review.files[i].THUMB_FILE_NM,
                      url: this.review.files[i].FILE_COURS,
                      type_file_video: this.review.files[i].TYPE_FILE_VIDEO
                  };
                  this.review.videoFiles.push(item_video);
              }
          }
          console.log(this.review.videoFiles);
          console.log(this.review);
      }
      });
  }

  updateReview() {
    this.api
      .all('reviews/edit')
      .customPUT(this.review)
      .subscribe(res => {
        this.isSaving = false;
        if (res.result) {
          this.toast.success('Update review successfully');
          this.router.navigate(['admin/reviews']);
        }
      });
  }

  onSubmit() {
    if (this.isSaving) {
      return;
    }
    this.isSaving = true;
    this.submitted = true;
    this.isHaveImage = this.images.isValidData();
    if (!this.isHaveImage) {
      this.isSaving = false;
      return;
    }
    if (this.uploader.queue && this.uploader.queue.length && this.isHaveImage) {
      this.uploader.uploadAll();
      this.isSaving = true;
      this.isHaveImage = true;

      this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
          this.isSaving = true;

          if (response) {
              const rs = JSON.parse(response);
              if (rs.result.error) {
                  item.remove();
                  this.isSaving = false;
                  this.isHaveImage = true;
                  return;
              } else {
                  this.review.videoFiles.push(rs.result);
              }
          }
          else {
              item.remove();
              this.isSaving = false;
              this.isHaveImage = true;
              return;
          }

      };
      this.uploader.onCompleteAll = () => {
          this.submitted = true;
          if (!this.isHaveImage) {
              this.isSaving = false;
              return;
          }
          if (this.isHaveImage) {
              this.images.onSave(res => {
                  this.review.images = res.images;
                  this.updateReview();
              });
          } else {
              this.isSaving = false;
              return;
              this.updateReview();
          }

      };
  } else {
    this.images.onSave(res => {
      this.review.images = res.images;
      this.updateReview();
    });
  }
  }

  isUpdate(): boolean {
    if (this.slug) {
      return false;
    } else {
      return true;
    }
  }
}
