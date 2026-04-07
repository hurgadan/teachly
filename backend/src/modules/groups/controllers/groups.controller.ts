import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestExtended } from '../../../_common/types';
import { transformToDto } from '../../../_common/utils/transform-to-dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateGroupDto } from '../dto/create-group.dto';
import { GroupDto } from '../dto/group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { GroupsService } from '../services/groups.service';

@ApiTags('Groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create group' })
  @ApiOkResponse({ type: GroupDto })
  public async createGroup(
    @Request() req: RequestExtended,
    @Body() data: CreateGroupDto,
  ): Promise<GroupDto> {
    const group = await this.groupsService.create(req.user!.id, data);
    return transformToDto(GroupDto, group);
  }

  @Get()
  @ApiOperation({ summary: 'Get groups' })
  @ApiOkResponse({ type: [GroupDto] })
  public async getGroups(@Request() req: RequestExtended): Promise<GroupDto[]> {
    const groups = await this.groupsService.findAll(req.user!.id);
    return groups.map((group) => transformToDto(GroupDto, group));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by id' })
  @ApiOkResponse({ type: GroupDto })
  public async getGroup(
    @Request() req: RequestExtended,
    @Param('id') id: string,
  ): Promise<GroupDto> {
    const group = await this.groupsService.getById(req.user!.id, id);
    return transformToDto(GroupDto, group);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update group' })
  @ApiOkResponse({ type: GroupDto })
  public async updateGroup(
    @Request() req: RequestExtended,
    @Param('id') id: string,
    @Body() data: UpdateGroupDto,
  ): Promise<GroupDto> {
    const group = await this.groupsService.update(req.user!.id, id, data);
    return transformToDto(GroupDto, group);
  }
}
