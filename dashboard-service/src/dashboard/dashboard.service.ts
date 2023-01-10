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

    async getOverallSchoolReports() {
        return this.reportModel.find(
            {
                "date": { "$gt": new Date(Date.now() - 24 * 3600 * 1000) }
            },
            '_id date school totalCheckIns totalCheckOuts totalFeversDetect',
            {
                populate: 'school',
                sort: { 'totalFeversDetect': -1 },
                limit: 100
            },
        ).exec()
    }

    async getDetailSchoolReports(schoolId: string) {
        const school = await this.schoolModel.findById(schoolId, '_id name', { lean: true }).exec()
        const reports = await this.reportModel.find({ school: schoolId })

        return {
            ...school,
            reports
        }
    }
}