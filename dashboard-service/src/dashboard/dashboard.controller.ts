import { Controller, Get, Param } from "@nestjs/common";
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
    getTodayReports(
        @Param('id') id: string 
    ) {
        return this.service.getDetailSchoolReports(id)
    }
}