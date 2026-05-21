export enum IncommingRequestLogging {
    enabled = '1',
    disabled = '0'
}

export enum Role {
    User = 'user',
    Admin = 'admin',
    Any = 'any'
}

export enum PageSize {
    Min = 10,
    Max = 100
}

export enum Language {
    English = 'en',
    Hindi = 'hi'
}

export enum DeliveryStatus {
    Pending = 'PENDING',
    InProgress = 'IN_PROGRESS',
    Delivered = 'DELIVERED',
    Failed = 'FAILED'
}

export enum Priority {
    Low = 'LOW',
    Medium = 'MEDIUM',
    High = 'HIGH',
    Urgent = 'URGENT'
}

export enum QueueType {
    CRITICAL = 'critical',
    NORMAL = 'normal',
    BULK = 'bulk',
    RETRY = 'retry',
    DLQ = 'dlq',
}