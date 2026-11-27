/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { createMock, DeepMocked } from '@golevelup/ts-vitest';

import { StreamController } from '../stream.controller';
import { StreamService } from '../stream.service';
import type { Response } from 'express';

describe('StreamController', () => {
  let controller: StreamController;
  let streamService: DeepMocked<StreamService>;
  let res: DeepMocked<Response>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamController],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return createMock(token);
        }
      })
      .compile();

    controller = module.get(StreamController);
    streamService = module.get(StreamService);
    res = createMock<Response>();
  });

  describe('streamVideo', () => {
    it('should authorize the video and redirect the stream', async () => {
      const videoId = '63c4d3f2-de4e-4cb8-9a89-f84fd07f2734';
      const fileName = 'manifest.mpd';

      await controller.streamVideo(videoId, fileName, res);

      expect(streamService.authorizedStream).toHaveBeenCalledTimes(1);
      expect(streamService.authorizedStream).toHaveBeenCalledWith(videoId);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Access-Control-Expose-Headers',
        'Content-Range, Accept-Ranges, Content-Length',
      );

      expect(res.setHeader).toHaveBeenCalledWith(
        'X-Accel-Redirect',
        `/videos/${videoId}/${fileName}`,
      );

      expect(res.end).toHaveBeenCalledTimes(1);
    });
  });
});
