import { Controller, Get, Param } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller()
export class DashboardController {
    constructor(
        private readonly service: DashboardService
    ) {}

    @Get('reports')
    getReports() {
        return this.service.getReports()
    }

    @Get('reports/today')
    getTodayReports(
        @Param('id') id: string 
    ) {
        return this.service.getSchoolReports(id)
    }
}