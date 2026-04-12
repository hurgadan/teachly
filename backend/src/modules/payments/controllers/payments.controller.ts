import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { RequestExtended } from '../../../_common/types';
import { transformToDto } from '../../../_common/utils/transform-to-dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaginatedPaymentsDto } from '../dto/paginated-payments.dto';
import { PaymentDto } from '../dto/payment.dto';
import { PaymentsQueryDto } from '../dto/payments-query.dto';
import { StudentBalanceDto } from '../dto/student-balance.dto';
import { PaymentsService } from '../services/payments.service';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payment' })
  @ApiOkResponse({ type: PaymentDto })
  public async create(
    @Request() req: RequestExtended,
    @Body() data: CreatePaymentDto,
  ): Promise<PaymentDto> {
    const payment = await this.paymentsService.create(req.user!.id, data);
    return transformToDto(PaymentDto, payment);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payment' })
  public async delete(@Request() req: RequestExtended, @Param('id') id: string): Promise<void> {
    await this.paymentsService.delete(req.user!.id, id);
  }

  @Get('students/balances')
  @ApiOperation({ summary: 'Get balances for all students' })
  @ApiOkResponse({ type: [StudentBalanceDto] })
  public async getStudentsBalances(@Request() req: RequestExtended): Promise<StudentBalanceDto[]> {
    const balances = await this.paymentsService.getStudentsBalances(req.user!.id);
    return balances.map((b) => transformToDto(StudentBalanceDto, b));
  }

  @Get()
  @ApiOperation({ summary: 'Get payments (paginated)' })
  @ApiOkResponse({ type: PaginatedPaymentsDto })
  public async findMany(
    @Request() req: RequestExtended,
    @Query() query: PaymentsQueryDto,
  ): Promise<PaginatedPaymentsDto> {
    const result = await this.paymentsService.findMany(
      req.user!.id,
      { studentId: query.studentId, groupId: query.groupId },
      query.page,
      query.limit,
    );

    return transformToDto(PaginatedPaymentsDto, {
      ...result,
      items: result.items.map((item) => transformToDto(PaymentDto, item)),
    });
  }
}
