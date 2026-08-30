import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from '~app/infra/object-storage/object-storage.service';
import { TEMP_BUCKET_NAME } from '~app/infra/object-storage/object-storage.constants';

const MAX_AGE_TEMP_FILE = 24 * 60 * 60 * 1000;

@Injectable()
export class TempStorageService {
  constructor(private readonly objectStorage: ObjectStorageService) {}

  async cleanUpBucketTemp() {
    const objects = await this.objectStorage.listObject({
      bucketName: TEMP_BUCKET_NAME,
    });

    const expiredObjectsKey = (objects.Contents ?? [])
      .filter((object) => {
        if (!object.Key || !object.LastModified) {
          return false;
        }

        const age = Date.now() - object.LastModified.getTime();
        return age >= MAX_AGE_TEMP_FILE;
      })
      .map((object) => ({
        Key: object.Key,
      }));

    if (expiredObjectsKey.length === 0) {
      return;
    }

    await this.objectStorage.deleteObjects({
      bucketName: TEMP_BUCKET_NAME,
      objectList: expiredObjectsKey,
    });
  }
}
