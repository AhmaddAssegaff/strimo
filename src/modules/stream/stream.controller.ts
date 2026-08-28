import { Controller, Get, Param, Res } from '@nestjs/common';
import { StreamService } from './stream.service';
import type { Response } from 'express';

@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Get(':videoId/*fileName')
  async streamVideo(
    @Param('videoId') videoId: string,
    @Param('fileName') fileName: string,
    @Res() res: Response,
  ) {
    await this.streamService.authorizedStream(videoId);

    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Range, Accept-Ranges, Content-Length',
    );
    res.setHeader('X-Accel-Redirect', `/videos/${videoId}/${fileName}`);

    return res.end();
  }
}
