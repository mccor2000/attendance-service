import { Controller, Get, Param, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller()
export class DashboardController {
    constructor(
        private readonly service: DashboardService
    ) {}

    @Get('schools')
    getOverallSchoolReports() {
        return this.service.getOverallSchoolReports()
    }

    @Get('schools/:id')
    getDetailsSchoolReports(
        @Param('id') id: string,
        // @Query('from') from: Date,
        // @Query('to') to: Date,
    ) {
        return this.service.getDetailSchoolReports(id)
    }
}