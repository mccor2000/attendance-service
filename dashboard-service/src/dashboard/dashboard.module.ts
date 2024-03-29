import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";

import { Report, ReportSchema } from "src/schemas/report.schema";
import { School, SchoolSchema } from "src/schemas/school.schema";

import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: School.name, schema: SchoolSchema },
            { name: Report.name, schema: ReportSchema},
        ])
    ],
    controllers: [DashboardController],
    providers: [DashboardService]
})
export class DashboardModule { }