import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestExtended } from '../../../_common/types';
import { transformToDto } from '../../../_common/utils/transform-to-dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { StudentBalanceDto } from '../dto/student-balance.dto';
import { PaymentsService } from '../services/payments.service';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get student balance' })
  @ApiOkResponse({ type: StudentBalanceDto })
  public async getStudentBalance(
    @Request() req: RequestExtended,
    @Param('id') id: string,
  ): Promise<StudentBalanceDto> {
    const balance = await this.paymentsService.getStudentBalance(req.user!.id, id);
    return transformToDto(StudentBalanceDto, balance);
  }
}
