import { Injectable } from '@nestjs/common';
import { PrismaService } from '~app/core/prisma/prisma.service';
import { UpdateChannelDto } from './dto/update-channel.dto';

@Injectable()
export class ChannelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async selectChannelById(channelId: string) {
    return await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async updateChannel(
    channelId: string,
    userId: string,
    updateChannelDto: UpdateChannelDto,
  ) {
    return await this.prisma.channel.update({
      where: {
        id: channelId,
        userId: userId,
      },
      data: updateChannelDto,
    });
  }

  async selectChannelByIdAndUserId(channelId: string, userId: string) {
    return await this.prisma.channel.findUnique({
      where: {
        id: channelId,
        userId: userId,
      },
    });
  }
}
