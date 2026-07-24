import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';
import { FileRule } from './file-upload.constant';

export function FileUploadPipe(rule: FileRule) {
  return new ParseFilePipe({
    fileIsRequired: rule.fileIsRequired,
    validators: [
      new FileTypeValidator({
        fileType: rule.fileTypeRegex,
        errorMessage: rule.fileTypeErrorMessage,
      }),
      new MaxFileSizeValidator({
        maxSize: rule.maxSize,
        errorMessage: rule.maxFileSizeErrorMessage,
      }),
    ],
  });
}
