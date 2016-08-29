export class UploadDialogController {
  constructor($mdDialog, Upload, Restangular, pipeline) {
    'ngInject';
    this.$mdDialog = $mdDialog;
    this.Upload = Upload;
    this.Restangular = Restangular;
    this.pipeline = pipeline;
    this.files = [];
  }
  cancel() {
    this.$mdDialog.cancel();
  }

  upload() {
    this.uploading = true;
    this.Upload.upload({
      url: this.pipeline.one('actions', 'execute').getRestangularUrl(),
      arrayKey: '',
      data: {
        data: this.files
      }
    })
    .then(
      (response) => {
        this.$mdDialog.hide(response.data);
      },
      (evt) => {
        this.progress = parseInt(100.0 * evt.loaded / evt.total);
      }
    );
  }

  removeFile(index) {
    this.files.splice(index, 1);
  }
}
