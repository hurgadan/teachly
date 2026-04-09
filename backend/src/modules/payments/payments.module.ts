import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CalendarModule } from '../calendar/calendar.module';
import { GroupsModule } from '../groups/groups.module';
import { StudentsModule } from '../students/students.module';
import { BalanceController } from './controllers/balance.controller';
import { PaymentsController } from './controllers/payments.controller';
import { PaymentEntity } from './dao/payment.entity';
import { PaymentsRepository } from './repositories/payments.repository';
import { PaymentsService } from './services/payments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PaymentEntity]),
    CalendarModule,
    StudentsModule,
    GroupsModule,
  ],
  controllers: [PaymentsController, BalanceController],
  providers: [PaymentsRepository, PaymentsService],
  exports: [PaymentsRepository, PaymentsService],
})
export class PaymentsModule {}
