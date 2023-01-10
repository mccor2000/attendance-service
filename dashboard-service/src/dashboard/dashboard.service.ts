import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ReportDocument } from "src/models/report.schema";
import { SchoolDocument } from "src/models/school.schema";

export class DashboardService {
    constructor(
        @InjectModel('School')
        private readonly schoolModel: Model<SchoolDocument>,
        @InjectModel('Report')
        private readonly reportModel: Model<ReportDocument>
    ) { }

    async getReports() {
        return this.reportModel.find(
            { "date": { "$gte": new Date().toLocaleDateString() } },
            '_id date school totalCheckIns totalCheckOuts totalFeversDetect',
            { populate: 'school', limit: 100},
            // { limit: 20 }
        ).exec()
    }

    async getSchoolReports(schoolId: string) {
        return this.reportModel.find(
            { schoolId }
        )
    }
}