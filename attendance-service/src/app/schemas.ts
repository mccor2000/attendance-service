import { JSONSchemaType } from 'ajv'
import { AttendanceType, ICreateAttendance } from '../core/domain'

export const CreateAttendanceRequest: JSONSchemaType<ICreateAttendance> = {
    $id: 'createAttendanceRequest',
    type: 'object',
    properties: {
        type: { type: 'string', enum: [AttendanceType.CHECKIN, AttendanceType.CHECKOUT] },
        timestamp: { type: 'integer', minimum: 1 },
        temperature: { type: 'integer', minimum: 1 },
        image: { type: 'string' },
        userId: { type: 'string', maxLength: 64 },
        schoolId: { type: 'string', maxLength: 64 },
    },
    required: ["type", "userId", "schoolId", "temperature", "timestamp", "image"],
    additionalProperties: false
}

export const UploadImageRequest: JSONSchemaType<{ file: string }> = {
    $id: 'uploadImageRequest',
    type: 'object',
    required: ['file'],
    properties: {
        file: { type: 'string' }
    },
    additionalProperties: false
}

export const ValidationException = {
    $id: 'validationError',
    type: 'object',
    properties: {
        errors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    field: { type: 'string' },
                    code: { type: 'string' },
                    message: { type: 'string' },
                }
            }
        }
    }
}

export const DefaultException = {
    $id: 'defaultError',
    type: 'object',
    properties: {
        errors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    code: { type: 'string' },
                    message: { type: 'string' },
                }
            }
        }
    }
}