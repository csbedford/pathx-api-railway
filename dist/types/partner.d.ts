import { z } from 'zod';
export declare const PartnerTypeSchema: z.ZodEnum<["DSP", "SOCIAL", "SEARCH", "RETAIL", "VIDEO", "NATIVE", "EMAIL", "AFFILIATE", "OTHER"]>;
export declare const PartnerStatusSchema: z.ZodEnum<["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"]>;
export declare const OnboardingStatusSchema: z.ZodEnum<["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "FAILED"]>;
export declare const ApiStatusSchema: z.ZodEnum<["HEALTHY", "DEGRADED", "DOWN", "UNKNOWN"]>;
export declare const CampaignPartnerStatusSchema: z.ZodEnum<["ASSOCIATED", "CONFIGURED", "LAUNCHED", "PAUSED", "COMPLETED", "FAILED"]>;
export declare const CapabilitySourceTypeSchema: z.ZodEnum<["MANUAL", "API_DISCOVERY", "DOCUMENTATION", "RATE_CARD", "FORM_SUBMISSION"]>;
export declare const CompanyInfoSchema: z.ZodObject<{
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    headquarters: z.ZodOptional<z.ZodString>;
    foundedYear: z.ZodOptional<z.ZodNumber>;
    employeeCount: z.ZodOptional<z.ZodString>;
    industry: z.ZodOptional<z.ZodString>;
    taxId: z.ZodOptional<z.ZodString>;
    businessRegistration: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    website?: string | undefined;
    headquarters?: string | undefined;
    foundedYear?: number | undefined;
    employeeCount?: string | undefined;
    industry?: string | undefined;
    taxId?: string | undefined;
    businessRegistration?: string | undefined;
}, {
    description?: string | undefined;
    website?: string | undefined;
    headquarters?: string | undefined;
    foundedYear?: number | undefined;
    employeeCount?: string | undefined;
    industry?: string | undefined;
    taxId?: string | undefined;
    businessRegistration?: string | undefined;
}>;
export declare const ContactInfoSchema: z.ZodObject<{
    primary: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    }>;
    technical: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    }>>;
    billing: z.ZodOptional<z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        phone: z.ZodOptional<z.ZodString>;
        role: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    }, {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    primary: {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    };
    technical?: {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billing?: {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}, {
    primary: {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    };
    technical?: {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    } | undefined;
    billing?: {
        name: string;
        email: string;
        role?: string | undefined;
        phone?: string | undefined;
    } | undefined;
}>;
export declare const ApiCredentialsSchema: z.ZodObject<{
    type: z.ZodEnum<["API_KEY", "OAUTH2", "JWT", "BASIC_AUTH"]>;
    credentials: z.ZodRecord<z.ZodString, z.ZodAny>;
    endpoints: z.ZodObject<{
        base: z.ZodString;
        auth: z.ZodOptional<z.ZodString>;
        sandbox: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        base: string;
        auth?: string | undefined;
        sandbox?: string | undefined;
    }, {
        base: string;
        auth?: string | undefined;
        sandbox?: string | undefined;
    }>;
    rateLimit: z.ZodOptional<z.ZodObject<{
        requests: z.ZodNumber;
        period: z.ZodString;
        concurrent: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        requests: number;
        period: string;
        concurrent?: number | undefined;
    }, {
        requests: number;
        period: string;
        concurrent?: number | undefined;
    }>>;
    lastTested: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
    credentials: Record<string, any>;
    endpoints: {
        base: string;
        auth?: string | undefined;
        sandbox?: string | undefined;
    };
    isActive: boolean;
    rateLimit?: {
        requests: number;
        period: string;
        concurrent?: number | undefined;
    } | undefined;
    lastTested?: string | undefined;
}, {
    type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
    credentials: Record<string, any>;
    endpoints: {
        base: string;
        auth?: string | undefined;
        sandbox?: string | undefined;
    };
    rateLimit?: {
        requests: number;
        period: string;
        concurrent?: number | undefined;
    } | undefined;
    lastTested?: string | undefined;
    isActive?: boolean | undefined;
}>;
export declare const TargetingOptionsSchema: z.ZodObject<{
    demographics: z.ZodOptional<z.ZodObject<{
        age: z.ZodDefault<z.ZodBoolean>;
        gender: z.ZodDefault<z.ZodBoolean>;
        income: z.ZodDefault<z.ZodBoolean>;
        education: z.ZodDefault<z.ZodBoolean>;
        location: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        gender: boolean;
        age: boolean;
        location: boolean;
        education: boolean;
        income: boolean;
    }, {
        gender?: boolean | undefined;
        age?: boolean | undefined;
        location?: boolean | undefined;
        education?: boolean | undefined;
        income?: boolean | undefined;
    }>>;
    behavioral: z.ZodOptional<z.ZodObject<{
        interests: z.ZodDefault<z.ZodBoolean>;
        purchase_history: z.ZodDefault<z.ZodBoolean>;
        website_behavior: z.ZodDefault<z.ZodBoolean>;
        app_usage: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        interests: boolean;
        purchase_history: boolean;
        website_behavior: boolean;
        app_usage: boolean;
    }, {
        interests?: boolean | undefined;
        purchase_history?: boolean | undefined;
        website_behavior?: boolean | undefined;
        app_usage?: boolean | undefined;
    }>>;
    contextual: z.ZodOptional<z.ZodObject<{
        keywords: z.ZodDefault<z.ZodBoolean>;
        content_category: z.ZodDefault<z.ZodBoolean>;
        device_type: z.ZodDefault<z.ZodBoolean>;
        time_of_day: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        keywords: boolean;
        content_category: boolean;
        device_type: boolean;
        time_of_day: boolean;
    }, {
        keywords?: boolean | undefined;
        content_category?: boolean | undefined;
        device_type?: boolean | undefined;
        time_of_day?: boolean | undefined;
    }>>;
    custom: z.ZodOptional<z.ZodObject<{
        lookalike: z.ZodDefault<z.ZodBoolean>;
        custom_audiences: z.ZodDefault<z.ZodBoolean>;
        retargeting: z.ZodDefault<z.ZodBoolean>;
        geofencing: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        lookalike: boolean;
        custom_audiences: boolean;
        retargeting: boolean;
        geofencing: boolean;
    }, {
        lookalike?: boolean | undefined;
        custom_audiences?: boolean | undefined;
        retargeting?: boolean | undefined;
        geofencing?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    demographics?: {
        gender: boolean;
        age: boolean;
        location: boolean;
        education: boolean;
        income: boolean;
    } | undefined;
    custom?: {
        lookalike: boolean;
        custom_audiences: boolean;
        retargeting: boolean;
        geofencing: boolean;
    } | undefined;
    behavioral?: {
        interests: boolean;
        purchase_history: boolean;
        website_behavior: boolean;
        app_usage: boolean;
    } | undefined;
    contextual?: {
        keywords: boolean;
        content_category: boolean;
        device_type: boolean;
        time_of_day: boolean;
    } | undefined;
}, {
    demographics?: {
        gender?: boolean | undefined;
        age?: boolean | undefined;
        location?: boolean | undefined;
        education?: boolean | undefined;
        income?: boolean | undefined;
    } | undefined;
    custom?: {
        lookalike?: boolean | undefined;
        custom_audiences?: boolean | undefined;
        retargeting?: boolean | undefined;
        geofencing?: boolean | undefined;
    } | undefined;
    behavioral?: {
        interests?: boolean | undefined;
        purchase_history?: boolean | undefined;
        website_behavior?: boolean | undefined;
        app_usage?: boolean | undefined;
    } | undefined;
    contextual?: {
        keywords?: boolean | undefined;
        content_category?: boolean | undefined;
        device_type?: boolean | undefined;
        time_of_day?: boolean | undefined;
    } | undefined;
}>;
export declare const MeasurementCapabilitiesSchema: z.ZodObject<{
    attribution: z.ZodObject<{
        first_click: z.ZodDefault<z.ZodBoolean>;
        last_click: z.ZodDefault<z.ZodBoolean>;
        linear: z.ZodDefault<z.ZodBoolean>;
        time_decay: z.ZodDefault<z.ZodBoolean>;
        position_based: z.ZodDefault<z.ZodBoolean>;
        data_driven: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        first_click: boolean;
        last_click: boolean;
        linear: boolean;
        time_decay: boolean;
        position_based: boolean;
        data_driven: boolean;
    }, {
        first_click?: boolean | undefined;
        last_click?: boolean | undefined;
        linear?: boolean | undefined;
        time_decay?: boolean | undefined;
        position_based?: boolean | undefined;
        data_driven?: boolean | undefined;
    }>;
    tracking: z.ZodObject<{
        impressions: z.ZodDefault<z.ZodBoolean>;
        clicks: z.ZodDefault<z.ZodBoolean>;
        conversions: z.ZodDefault<z.ZodBoolean>;
        view_through: z.ZodDefault<z.ZodBoolean>;
        cross_device: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        impressions: boolean;
        clicks: boolean;
        conversions: boolean;
        view_through: boolean;
        cross_device: boolean;
    }, {
        impressions?: boolean | undefined;
        clicks?: boolean | undefined;
        conversions?: boolean | undefined;
        view_through?: boolean | undefined;
        cross_device?: boolean | undefined;
    }>;
    reporting: z.ZodObject<{
        real_time: z.ZodDefault<z.ZodBoolean>;
        hourly: z.ZodDefault<z.ZodBoolean>;
        daily: z.ZodDefault<z.ZodBoolean>;
        custom_metrics: z.ZodDefault<z.ZodBoolean>;
        audience_insights: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        real_time: boolean;
        hourly: boolean;
        daily: boolean;
        custom_metrics: boolean;
        audience_insights: boolean;
    }, {
        real_time?: boolean | undefined;
        hourly?: boolean | undefined;
        daily?: boolean | undefined;
        custom_metrics?: boolean | undefined;
        audience_insights?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    attribution: {
        first_click: boolean;
        last_click: boolean;
        linear: boolean;
        time_decay: boolean;
        position_based: boolean;
        data_driven: boolean;
    };
    tracking: {
        impressions: boolean;
        clicks: boolean;
        conversions: boolean;
        view_through: boolean;
        cross_device: boolean;
    };
    reporting: {
        real_time: boolean;
        hourly: boolean;
        daily: boolean;
        custom_metrics: boolean;
        audience_insights: boolean;
    };
}, {
    attribution: {
        first_click?: boolean | undefined;
        last_click?: boolean | undefined;
        linear?: boolean | undefined;
        time_decay?: boolean | undefined;
        position_based?: boolean | undefined;
        data_driven?: boolean | undefined;
    };
    tracking: {
        impressions?: boolean | undefined;
        clicks?: boolean | undefined;
        conversions?: boolean | undefined;
        view_through?: boolean | undefined;
        cross_device?: boolean | undefined;
    };
    reporting: {
        real_time?: boolean | undefined;
        hourly?: boolean | undefined;
        daily?: boolean | undefined;
        custom_metrics?: boolean | undefined;
        audience_insights?: boolean | undefined;
    };
}>;
export declare const OnboardingStepsSchema: z.ZodObject<{
    steps: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED", "SKIPPED"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        order: z.ZodNumber;
        estimatedTime: z.ZodOptional<z.ZodString>;
        dependencies: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "SKIPPED";
        name: string;
        description: string;
        id: string;
        required: boolean;
        order: number;
        metadata?: Record<string, any> | undefined;
        estimatedTime?: string | undefined;
        dependencies?: string[] | undefined;
    }, {
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "SKIPPED";
        name: string;
        description: string;
        id: string;
        order: number;
        metadata?: Record<string, any> | undefined;
        required?: boolean | undefined;
        estimatedTime?: string | undefined;
        dependencies?: string[] | undefined;
    }>, "many">;
    currentStep: z.ZodOptional<z.ZodString>;
    completedAt: z.ZodOptional<z.ZodString>;
    failedAt: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    steps: {
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "SKIPPED";
        name: string;
        description: string;
        id: string;
        required: boolean;
        order: number;
        metadata?: Record<string, any> | undefined;
        estimatedTime?: string | undefined;
        dependencies?: string[] | undefined;
    }[];
    currentStep?: string | undefined;
    completedAt?: string | undefined;
    failedAt?: string | undefined;
    notes?: string | undefined;
}, {
    steps: {
        status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "SKIPPED";
        name: string;
        description: string;
        id: string;
        order: number;
        metadata?: Record<string, any> | undefined;
        required?: boolean | undefined;
        estimatedTime?: string | undefined;
        dependencies?: string[] | undefined;
    }[];
    currentStep?: string | undefined;
    completedAt?: string | undefined;
    failedAt?: string | undefined;
    notes?: string | undefined;
}>;
export declare const PricingInfoSchema: z.ZodObject<{
    model: z.ZodEnum<["CPM", "CPC", "CPA", "FIXED", "PERCENTAGE", "HYBRID"]>;
    minimumSpend: z.ZodOptional<z.ZodNumber>;
    rates: z.ZodRecord<z.ZodString, z.ZodNumber>;
    currency: z.ZodDefault<z.ZodString>;
    discounts: z.ZodOptional<z.ZodArray<z.ZodObject<{
        threshold: z.ZodNumber;
        rate: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        threshold: number;
        rate: number;
        description?: string | undefined;
    }, {
        threshold: number;
        rate: number;
        description?: string | undefined;
    }>, "many">>;
    fees: z.ZodOptional<z.ZodObject<{
        setup: z.ZodOptional<z.ZodNumber>;
        management: z.ZodOptional<z.ZodNumber>;
        platform: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        setup?: number | undefined;
        management?: number | undefined;
        platform?: number | undefined;
    }, {
        setup?: number | undefined;
        management?: number | undefined;
        platform?: number | undefined;
    }>>;
    lastUpdated: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    currency: string;
    model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
    rates: Record<string, number>;
    minimumSpend?: number | undefined;
    discounts?: {
        threshold: number;
        rate: number;
        description?: string | undefined;
    }[] | undefined;
    fees?: {
        setup?: number | undefined;
        management?: number | undefined;
        platform?: number | undefined;
    } | undefined;
    lastUpdated?: string | undefined;
}, {
    model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
    rates: Record<string, number>;
    currency?: string | undefined;
    minimumSpend?: number | undefined;
    discounts?: {
        threshold: number;
        rate: number;
        description?: string | undefined;
    }[] | undefined;
    fees?: {
        setup?: number | undefined;
        management?: number | undefined;
        platform?: number | undefined;
    } | undefined;
    lastUpdated?: string | undefined;
}>;
export declare const CreatePartnerSchema: z.ZodObject<{
    name: z.ZodString;
    displayName: z.ZodString;
    type: z.ZodEnum<["DSP", "SOCIAL", "SEARCH", "RETAIL", "VIDEO", "NATIVE", "EMAIL", "AFFILIATE", "OTHER"]>;
    companyInfo: z.ZodObject<{
        website: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        headquarters: z.ZodOptional<z.ZodString>;
        foundedYear: z.ZodOptional<z.ZodNumber>;
        employeeCount: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        taxId: z.ZodOptional<z.ZodString>;
        businessRegistration: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    }, {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    }>;
    contactInfo: z.ZodObject<{
        primary: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>;
        technical: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>>;
        billing: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    }, {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    }>;
    apiCredentials: z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["API_KEY", "OAUTH2", "JWT", "BASIC_AUTH"]>;
        credentials: z.ZodRecord<z.ZodString, z.ZodAny>;
        endpoints: z.ZodObject<{
            base: z.ZodString;
            auth: z.ZodOptional<z.ZodString>;
            sandbox: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        }, {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        }>;
        rateLimit: z.ZodOptional<z.ZodObject<{
            requests: z.ZodNumber;
            period: z.ZodString;
            concurrent: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        }, {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        }>>;
        lastTested: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        isActive: boolean;
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
    }, {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
        isActive?: boolean | undefined;
    }>>;
    targetingOptions: z.ZodOptional<z.ZodObject<{
        demographics: z.ZodOptional<z.ZodObject<{
            age: z.ZodDefault<z.ZodBoolean>;
            gender: z.ZodDefault<z.ZodBoolean>;
            income: z.ZodDefault<z.ZodBoolean>;
            education: z.ZodDefault<z.ZodBoolean>;
            location: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            gender: boolean;
            age: boolean;
            location: boolean;
            education: boolean;
            income: boolean;
        }, {
            gender?: boolean | undefined;
            age?: boolean | undefined;
            location?: boolean | undefined;
            education?: boolean | undefined;
            income?: boolean | undefined;
        }>>;
        behavioral: z.ZodOptional<z.ZodObject<{
            interests: z.ZodDefault<z.ZodBoolean>;
            purchase_history: z.ZodDefault<z.ZodBoolean>;
            website_behavior: z.ZodDefault<z.ZodBoolean>;
            app_usage: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            interests: boolean;
            purchase_history: boolean;
            website_behavior: boolean;
            app_usage: boolean;
        }, {
            interests?: boolean | undefined;
            purchase_history?: boolean | undefined;
            website_behavior?: boolean | undefined;
            app_usage?: boolean | undefined;
        }>>;
        contextual: z.ZodOptional<z.ZodObject<{
            keywords: z.ZodDefault<z.ZodBoolean>;
            content_category: z.ZodDefault<z.ZodBoolean>;
            device_type: z.ZodDefault<z.ZodBoolean>;
            time_of_day: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            keywords: boolean;
            content_category: boolean;
            device_type: boolean;
            time_of_day: boolean;
        }, {
            keywords?: boolean | undefined;
            content_category?: boolean | undefined;
            device_type?: boolean | undefined;
            time_of_day?: boolean | undefined;
        }>>;
        custom: z.ZodOptional<z.ZodObject<{
            lookalike: z.ZodDefault<z.ZodBoolean>;
            custom_audiences: z.ZodDefault<z.ZodBoolean>;
            retargeting: z.ZodDefault<z.ZodBoolean>;
            geofencing: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            lookalike: boolean;
            custom_audiences: boolean;
            retargeting: boolean;
            geofencing: boolean;
        }, {
            lookalike?: boolean | undefined;
            custom_audiences?: boolean | undefined;
            retargeting?: boolean | undefined;
            geofencing?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        demographics?: {
            gender: boolean;
            age: boolean;
            location: boolean;
            education: boolean;
            income: boolean;
        } | undefined;
        custom?: {
            lookalike: boolean;
            custom_audiences: boolean;
            retargeting: boolean;
            geofencing: boolean;
        } | undefined;
        behavioral?: {
            interests: boolean;
            purchase_history: boolean;
            website_behavior: boolean;
            app_usage: boolean;
        } | undefined;
        contextual?: {
            keywords: boolean;
            content_category: boolean;
            device_type: boolean;
            time_of_day: boolean;
        } | undefined;
    }, {
        demographics?: {
            gender?: boolean | undefined;
            age?: boolean | undefined;
            location?: boolean | undefined;
            education?: boolean | undefined;
            income?: boolean | undefined;
        } | undefined;
        custom?: {
            lookalike?: boolean | undefined;
            custom_audiences?: boolean | undefined;
            retargeting?: boolean | undefined;
            geofencing?: boolean | undefined;
        } | undefined;
        behavioral?: {
            interests?: boolean | undefined;
            purchase_history?: boolean | undefined;
            website_behavior?: boolean | undefined;
            app_usage?: boolean | undefined;
        } | undefined;
        contextual?: {
            keywords?: boolean | undefined;
            content_category?: boolean | undefined;
            device_type?: boolean | undefined;
            time_of_day?: boolean | undefined;
        } | undefined;
    }>>;
    measurementCapabilities: z.ZodOptional<z.ZodObject<{
        attribution: z.ZodObject<{
            first_click: z.ZodDefault<z.ZodBoolean>;
            last_click: z.ZodDefault<z.ZodBoolean>;
            linear: z.ZodDefault<z.ZodBoolean>;
            time_decay: z.ZodDefault<z.ZodBoolean>;
            position_based: z.ZodDefault<z.ZodBoolean>;
            data_driven: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            first_click: boolean;
            last_click: boolean;
            linear: boolean;
            time_decay: boolean;
            position_based: boolean;
            data_driven: boolean;
        }, {
            first_click?: boolean | undefined;
            last_click?: boolean | undefined;
            linear?: boolean | undefined;
            time_decay?: boolean | undefined;
            position_based?: boolean | undefined;
            data_driven?: boolean | undefined;
        }>;
        tracking: z.ZodObject<{
            impressions: z.ZodDefault<z.ZodBoolean>;
            clicks: z.ZodDefault<z.ZodBoolean>;
            conversions: z.ZodDefault<z.ZodBoolean>;
            view_through: z.ZodDefault<z.ZodBoolean>;
            cross_device: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            impressions: boolean;
            clicks: boolean;
            conversions: boolean;
            view_through: boolean;
            cross_device: boolean;
        }, {
            impressions?: boolean | undefined;
            clicks?: boolean | undefined;
            conversions?: boolean | undefined;
            view_through?: boolean | undefined;
            cross_device?: boolean | undefined;
        }>;
        reporting: z.ZodObject<{
            real_time: z.ZodDefault<z.ZodBoolean>;
            hourly: z.ZodDefault<z.ZodBoolean>;
            daily: z.ZodDefault<z.ZodBoolean>;
            custom_metrics: z.ZodDefault<z.ZodBoolean>;
            audience_insights: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            real_time: boolean;
            hourly: boolean;
            daily: boolean;
            custom_metrics: boolean;
            audience_insights: boolean;
        }, {
            real_time?: boolean | undefined;
            hourly?: boolean | undefined;
            daily?: boolean | undefined;
            custom_metrics?: boolean | undefined;
            audience_insights?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        attribution: {
            first_click: boolean;
            last_click: boolean;
            linear: boolean;
            time_decay: boolean;
            position_based: boolean;
            data_driven: boolean;
        };
        tracking: {
            impressions: boolean;
            clicks: boolean;
            conversions: boolean;
            view_through: boolean;
            cross_device: boolean;
        };
        reporting: {
            real_time: boolean;
            hourly: boolean;
            daily: boolean;
            custom_metrics: boolean;
            audience_insights: boolean;
        };
    }, {
        attribution: {
            first_click?: boolean | undefined;
            last_click?: boolean | undefined;
            linear?: boolean | undefined;
            time_decay?: boolean | undefined;
            position_based?: boolean | undefined;
            data_driven?: boolean | undefined;
        };
        tracking: {
            impressions?: boolean | undefined;
            clicks?: boolean | undefined;
            conversions?: boolean | undefined;
            view_through?: boolean | undefined;
            cross_device?: boolean | undefined;
        };
        reporting: {
            real_time?: boolean | undefined;
            hourly?: boolean | undefined;
            daily?: boolean | undefined;
            custom_metrics?: boolean | undefined;
            audience_insights?: boolean | undefined;
        };
    }>>;
    pricingInfo: z.ZodOptional<z.ZodObject<{
        model: z.ZodEnum<["CPM", "CPC", "CPA", "FIXED", "PERCENTAGE", "HYBRID"]>;
        minimumSpend: z.ZodOptional<z.ZodNumber>;
        rates: z.ZodRecord<z.ZodString, z.ZodNumber>;
        currency: z.ZodDefault<z.ZodString>;
        discounts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            threshold: z.ZodNumber;
            rate: z.ZodNumber;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }, {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }>, "many">>;
        fees: z.ZodOptional<z.ZodObject<{
            setup: z.ZodOptional<z.ZodNumber>;
            management: z.ZodOptional<z.ZodNumber>;
            platform: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        }, {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        }>>;
        lastUpdated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    }, {
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        currency?: string | undefined;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    type: "SEARCH" | "DSP" | "SOCIAL" | "RETAIL" | "VIDEO" | "NATIVE" | "EMAIL" | "AFFILIATE" | "OTHER";
    name: string;
    displayName: string;
    companyInfo: {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    };
    contactInfo: {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    };
    apiCredentials?: {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        isActive: boolean;
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
    } | undefined;
    targetingOptions?: {
        demographics?: {
            gender: boolean;
            age: boolean;
            location: boolean;
            education: boolean;
            income: boolean;
        } | undefined;
        custom?: {
            lookalike: boolean;
            custom_audiences: boolean;
            retargeting: boolean;
            geofencing: boolean;
        } | undefined;
        behavioral?: {
            interests: boolean;
            purchase_history: boolean;
            website_behavior: boolean;
            app_usage: boolean;
        } | undefined;
        contextual?: {
            keywords: boolean;
            content_category: boolean;
            device_type: boolean;
            time_of_day: boolean;
        } | undefined;
    } | undefined;
    measurementCapabilities?: {
        attribution: {
            first_click: boolean;
            last_click: boolean;
            linear: boolean;
            time_decay: boolean;
            position_based: boolean;
            data_driven: boolean;
        };
        tracking: {
            impressions: boolean;
            clicks: boolean;
            conversions: boolean;
            view_through: boolean;
            cross_device: boolean;
        };
        reporting: {
            real_time: boolean;
            hourly: boolean;
            daily: boolean;
            custom_metrics: boolean;
            audience_insights: boolean;
        };
    } | undefined;
    pricingInfo?: {
        currency: string;
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    } | undefined;
}, {
    type: "SEARCH" | "DSP" | "SOCIAL" | "RETAIL" | "VIDEO" | "NATIVE" | "EMAIL" | "AFFILIATE" | "OTHER";
    name: string;
    displayName: string;
    companyInfo: {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    };
    contactInfo: {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    };
    apiCredentials?: {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
        isActive?: boolean | undefined;
    } | undefined;
    targetingOptions?: {
        demographics?: {
            gender?: boolean | undefined;
            age?: boolean | undefined;
            location?: boolean | undefined;
            education?: boolean | undefined;
            income?: boolean | undefined;
        } | undefined;
        custom?: {
            lookalike?: boolean | undefined;
            custom_audiences?: boolean | undefined;
            retargeting?: boolean | undefined;
            geofencing?: boolean | undefined;
        } | undefined;
        behavioral?: {
            interests?: boolean | undefined;
            purchase_history?: boolean | undefined;
            website_behavior?: boolean | undefined;
            app_usage?: boolean | undefined;
        } | undefined;
        contextual?: {
            keywords?: boolean | undefined;
            content_category?: boolean | undefined;
            device_type?: boolean | undefined;
            time_of_day?: boolean | undefined;
        } | undefined;
    } | undefined;
    measurementCapabilities?: {
        attribution: {
            first_click?: boolean | undefined;
            last_click?: boolean | undefined;
            linear?: boolean | undefined;
            time_decay?: boolean | undefined;
            position_based?: boolean | undefined;
            data_driven?: boolean | undefined;
        };
        tracking: {
            impressions?: boolean | undefined;
            clicks?: boolean | undefined;
            conversions?: boolean | undefined;
            view_through?: boolean | undefined;
            cross_device?: boolean | undefined;
        };
        reporting: {
            real_time?: boolean | undefined;
            hourly?: boolean | undefined;
            daily?: boolean | undefined;
            custom_metrics?: boolean | undefined;
            audience_insights?: boolean | undefined;
        };
    } | undefined;
    pricingInfo?: {
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        currency?: string | undefined;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    } | undefined;
}>;
export declare const UpdatePartnerSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["DSP", "SOCIAL", "SEARCH", "RETAIL", "VIDEO", "NATIVE", "EMAIL", "AFFILIATE", "OTHER"]>>;
    companyInfo: z.ZodOptional<z.ZodObject<{
        website: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        headquarters: z.ZodOptional<z.ZodString>;
        foundedYear: z.ZodOptional<z.ZodNumber>;
        employeeCount: z.ZodOptional<z.ZodString>;
        industry: z.ZodOptional<z.ZodString>;
        taxId: z.ZodOptional<z.ZodString>;
        businessRegistration: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    }, {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    }>>;
    contactInfo: z.ZodOptional<z.ZodObject<{
        primary: z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>;
        technical: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>>;
        billing: z.ZodOptional<z.ZodObject<{
            name: z.ZodString;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            role: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }, {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    }, {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    }>>;
    apiCredentials: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        type: z.ZodEnum<["API_KEY", "OAUTH2", "JWT", "BASIC_AUTH"]>;
        credentials: z.ZodRecord<z.ZodString, z.ZodAny>;
        endpoints: z.ZodObject<{
            base: z.ZodString;
            auth: z.ZodOptional<z.ZodString>;
            sandbox: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        }, {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        }>;
        rateLimit: z.ZodOptional<z.ZodObject<{
            requests: z.ZodNumber;
            period: z.ZodString;
            concurrent: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        }, {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        }>>;
        lastTested: z.ZodOptional<z.ZodString>;
        isActive: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        isActive: boolean;
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
    }, {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
        isActive?: boolean | undefined;
    }>>>;
    targetingOptions: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        demographics: z.ZodOptional<z.ZodObject<{
            age: z.ZodDefault<z.ZodBoolean>;
            gender: z.ZodDefault<z.ZodBoolean>;
            income: z.ZodDefault<z.ZodBoolean>;
            education: z.ZodDefault<z.ZodBoolean>;
            location: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            gender: boolean;
            age: boolean;
            location: boolean;
            education: boolean;
            income: boolean;
        }, {
            gender?: boolean | undefined;
            age?: boolean | undefined;
            location?: boolean | undefined;
            education?: boolean | undefined;
            income?: boolean | undefined;
        }>>;
        behavioral: z.ZodOptional<z.ZodObject<{
            interests: z.ZodDefault<z.ZodBoolean>;
            purchase_history: z.ZodDefault<z.ZodBoolean>;
            website_behavior: z.ZodDefault<z.ZodBoolean>;
            app_usage: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            interests: boolean;
            purchase_history: boolean;
            website_behavior: boolean;
            app_usage: boolean;
        }, {
            interests?: boolean | undefined;
            purchase_history?: boolean | undefined;
            website_behavior?: boolean | undefined;
            app_usage?: boolean | undefined;
        }>>;
        contextual: z.ZodOptional<z.ZodObject<{
            keywords: z.ZodDefault<z.ZodBoolean>;
            content_category: z.ZodDefault<z.ZodBoolean>;
            device_type: z.ZodDefault<z.ZodBoolean>;
            time_of_day: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            keywords: boolean;
            content_category: boolean;
            device_type: boolean;
            time_of_day: boolean;
        }, {
            keywords?: boolean | undefined;
            content_category?: boolean | undefined;
            device_type?: boolean | undefined;
            time_of_day?: boolean | undefined;
        }>>;
        custom: z.ZodOptional<z.ZodObject<{
            lookalike: z.ZodDefault<z.ZodBoolean>;
            custom_audiences: z.ZodDefault<z.ZodBoolean>;
            retargeting: z.ZodDefault<z.ZodBoolean>;
            geofencing: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            lookalike: boolean;
            custom_audiences: boolean;
            retargeting: boolean;
            geofencing: boolean;
        }, {
            lookalike?: boolean | undefined;
            custom_audiences?: boolean | undefined;
            retargeting?: boolean | undefined;
            geofencing?: boolean | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        demographics?: {
            gender: boolean;
            age: boolean;
            location: boolean;
            education: boolean;
            income: boolean;
        } | undefined;
        custom?: {
            lookalike: boolean;
            custom_audiences: boolean;
            retargeting: boolean;
            geofencing: boolean;
        } | undefined;
        behavioral?: {
            interests: boolean;
            purchase_history: boolean;
            website_behavior: boolean;
            app_usage: boolean;
        } | undefined;
        contextual?: {
            keywords: boolean;
            content_category: boolean;
            device_type: boolean;
            time_of_day: boolean;
        } | undefined;
    }, {
        demographics?: {
            gender?: boolean | undefined;
            age?: boolean | undefined;
            location?: boolean | undefined;
            education?: boolean | undefined;
            income?: boolean | undefined;
        } | undefined;
        custom?: {
            lookalike?: boolean | undefined;
            custom_audiences?: boolean | undefined;
            retargeting?: boolean | undefined;
            geofencing?: boolean | undefined;
        } | undefined;
        behavioral?: {
            interests?: boolean | undefined;
            purchase_history?: boolean | undefined;
            website_behavior?: boolean | undefined;
            app_usage?: boolean | undefined;
        } | undefined;
        contextual?: {
            keywords?: boolean | undefined;
            content_category?: boolean | undefined;
            device_type?: boolean | undefined;
            time_of_day?: boolean | undefined;
        } | undefined;
    }>>>;
    measurementCapabilities: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        attribution: z.ZodObject<{
            first_click: z.ZodDefault<z.ZodBoolean>;
            last_click: z.ZodDefault<z.ZodBoolean>;
            linear: z.ZodDefault<z.ZodBoolean>;
            time_decay: z.ZodDefault<z.ZodBoolean>;
            position_based: z.ZodDefault<z.ZodBoolean>;
            data_driven: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            first_click: boolean;
            last_click: boolean;
            linear: boolean;
            time_decay: boolean;
            position_based: boolean;
            data_driven: boolean;
        }, {
            first_click?: boolean | undefined;
            last_click?: boolean | undefined;
            linear?: boolean | undefined;
            time_decay?: boolean | undefined;
            position_based?: boolean | undefined;
            data_driven?: boolean | undefined;
        }>;
        tracking: z.ZodObject<{
            impressions: z.ZodDefault<z.ZodBoolean>;
            clicks: z.ZodDefault<z.ZodBoolean>;
            conversions: z.ZodDefault<z.ZodBoolean>;
            view_through: z.ZodDefault<z.ZodBoolean>;
            cross_device: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            impressions: boolean;
            clicks: boolean;
            conversions: boolean;
            view_through: boolean;
            cross_device: boolean;
        }, {
            impressions?: boolean | undefined;
            clicks?: boolean | undefined;
            conversions?: boolean | undefined;
            view_through?: boolean | undefined;
            cross_device?: boolean | undefined;
        }>;
        reporting: z.ZodObject<{
            real_time: z.ZodDefault<z.ZodBoolean>;
            hourly: z.ZodDefault<z.ZodBoolean>;
            daily: z.ZodDefault<z.ZodBoolean>;
            custom_metrics: z.ZodDefault<z.ZodBoolean>;
            audience_insights: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            real_time: boolean;
            hourly: boolean;
            daily: boolean;
            custom_metrics: boolean;
            audience_insights: boolean;
        }, {
            real_time?: boolean | undefined;
            hourly?: boolean | undefined;
            daily?: boolean | undefined;
            custom_metrics?: boolean | undefined;
            audience_insights?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        attribution: {
            first_click: boolean;
            last_click: boolean;
            linear: boolean;
            time_decay: boolean;
            position_based: boolean;
            data_driven: boolean;
        };
        tracking: {
            impressions: boolean;
            clicks: boolean;
            conversions: boolean;
            view_through: boolean;
            cross_device: boolean;
        };
        reporting: {
            real_time: boolean;
            hourly: boolean;
            daily: boolean;
            custom_metrics: boolean;
            audience_insights: boolean;
        };
    }, {
        attribution: {
            first_click?: boolean | undefined;
            last_click?: boolean | undefined;
            linear?: boolean | undefined;
            time_decay?: boolean | undefined;
            position_based?: boolean | undefined;
            data_driven?: boolean | undefined;
        };
        tracking: {
            impressions?: boolean | undefined;
            clicks?: boolean | undefined;
            conversions?: boolean | undefined;
            view_through?: boolean | undefined;
            cross_device?: boolean | undefined;
        };
        reporting: {
            real_time?: boolean | undefined;
            hourly?: boolean | undefined;
            daily?: boolean | undefined;
            custom_metrics?: boolean | undefined;
            audience_insights?: boolean | undefined;
        };
    }>>>;
    pricingInfo: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        model: z.ZodEnum<["CPM", "CPC", "CPA", "FIXED", "PERCENTAGE", "HYBRID"]>;
        minimumSpend: z.ZodOptional<z.ZodNumber>;
        rates: z.ZodRecord<z.ZodString, z.ZodNumber>;
        currency: z.ZodDefault<z.ZodString>;
        discounts: z.ZodOptional<z.ZodArray<z.ZodObject<{
            threshold: z.ZodNumber;
            rate: z.ZodNumber;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }, {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }>, "many">>;
        fees: z.ZodOptional<z.ZodObject<{
            setup: z.ZodOptional<z.ZodNumber>;
            management: z.ZodOptional<z.ZodNumber>;
            platform: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        }, {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        }>>;
        lastUpdated: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        currency: string;
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    }, {
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        currency?: string | undefined;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    type?: "SEARCH" | "DSP" | "SOCIAL" | "RETAIL" | "VIDEO" | "NATIVE" | "EMAIL" | "AFFILIATE" | "OTHER" | undefined;
    name?: string | undefined;
    displayName?: string | undefined;
    companyInfo?: {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    } | undefined;
    contactInfo?: {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    } | undefined;
    apiCredentials?: {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        isActive: boolean;
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
    } | undefined;
    targetingOptions?: {
        demographics?: {
            gender: boolean;
            age: boolean;
            location: boolean;
            education: boolean;
            income: boolean;
        } | undefined;
        custom?: {
            lookalike: boolean;
            custom_audiences: boolean;
            retargeting: boolean;
            geofencing: boolean;
        } | undefined;
        behavioral?: {
            interests: boolean;
            purchase_history: boolean;
            website_behavior: boolean;
            app_usage: boolean;
        } | undefined;
        contextual?: {
            keywords: boolean;
            content_category: boolean;
            device_type: boolean;
            time_of_day: boolean;
        } | undefined;
    } | undefined;
    measurementCapabilities?: {
        attribution: {
            first_click: boolean;
            last_click: boolean;
            linear: boolean;
            time_decay: boolean;
            position_based: boolean;
            data_driven: boolean;
        };
        tracking: {
            impressions: boolean;
            clicks: boolean;
            conversions: boolean;
            view_through: boolean;
            cross_device: boolean;
        };
        reporting: {
            real_time: boolean;
            hourly: boolean;
            daily: boolean;
            custom_metrics: boolean;
            audience_insights: boolean;
        };
    } | undefined;
    pricingInfo?: {
        currency: string;
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    } | undefined;
}, {
    type?: "SEARCH" | "DSP" | "SOCIAL" | "RETAIL" | "VIDEO" | "NATIVE" | "EMAIL" | "AFFILIATE" | "OTHER" | undefined;
    name?: string | undefined;
    displayName?: string | undefined;
    companyInfo?: {
        description?: string | undefined;
        website?: string | undefined;
        headquarters?: string | undefined;
        foundedYear?: number | undefined;
        employeeCount?: string | undefined;
        industry?: string | undefined;
        taxId?: string | undefined;
        businessRegistration?: string | undefined;
    } | undefined;
    contactInfo?: {
        primary: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        };
        technical?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
        billing?: {
            name: string;
            email: string;
            role?: string | undefined;
            phone?: string | undefined;
        } | undefined;
    } | undefined;
    apiCredentials?: {
        type: "API_KEY" | "OAUTH2" | "JWT" | "BASIC_AUTH";
        credentials: Record<string, any>;
        endpoints: {
            base: string;
            auth?: string | undefined;
            sandbox?: string | undefined;
        };
        rateLimit?: {
            requests: number;
            period: string;
            concurrent?: number | undefined;
        } | undefined;
        lastTested?: string | undefined;
        isActive?: boolean | undefined;
    } | undefined;
    targetingOptions?: {
        demographics?: {
            gender?: boolean | undefined;
            age?: boolean | undefined;
            location?: boolean | undefined;
            education?: boolean | undefined;
            income?: boolean | undefined;
        } | undefined;
        custom?: {
            lookalike?: boolean | undefined;
            custom_audiences?: boolean | undefined;
            retargeting?: boolean | undefined;
            geofencing?: boolean | undefined;
        } | undefined;
        behavioral?: {
            interests?: boolean | undefined;
            purchase_history?: boolean | undefined;
            website_behavior?: boolean | undefined;
            app_usage?: boolean | undefined;
        } | undefined;
        contextual?: {
            keywords?: boolean | undefined;
            content_category?: boolean | undefined;
            device_type?: boolean | undefined;
            time_of_day?: boolean | undefined;
        } | undefined;
    } | undefined;
    measurementCapabilities?: {
        attribution: {
            first_click?: boolean | undefined;
            last_click?: boolean | undefined;
            linear?: boolean | undefined;
            time_decay?: boolean | undefined;
            position_based?: boolean | undefined;
            data_driven?: boolean | undefined;
        };
        tracking: {
            impressions?: boolean | undefined;
            clicks?: boolean | undefined;
            conversions?: boolean | undefined;
            view_through?: boolean | undefined;
            cross_device?: boolean | undefined;
        };
        reporting: {
            real_time?: boolean | undefined;
            hourly?: boolean | undefined;
            daily?: boolean | undefined;
            custom_metrics?: boolean | undefined;
            audience_insights?: boolean | undefined;
        };
    } | undefined;
    pricingInfo?: {
        model: "CPM" | "CPC" | "CPA" | "FIXED" | "PERCENTAGE" | "HYBRID";
        rates: Record<string, number>;
        currency?: string | undefined;
        minimumSpend?: number | undefined;
        discounts?: {
            threshold: number;
            rate: number;
            description?: string | undefined;
        }[] | undefined;
        fees?: {
            setup?: number | undefined;
            management?: number | undefined;
            platform?: number | undefined;
        } | undefined;
        lastUpdated?: string | undefined;
    } | undefined;
}>;
export declare const PartnerHealthMetricSchema: z.ZodObject<{
    timestamp: z.ZodString;
    apiStatus: z.ZodEnum<["HEALTHY", "DEGRADED", "DOWN", "UNKNOWN"]>;
    responseTime: z.ZodOptional<z.ZodNumber>;
    errorRate: z.ZodOptional<z.ZodNumber>;
    uptime: z.ZodOptional<z.ZodNumber>;
    lastError: z.ZodOptional<z.ZodString>;
    healthScore: z.ZodOptional<z.ZodNumber>;
    details: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    apiStatus: "HEALTHY" | "DEGRADED" | "DOWN" | "UNKNOWN";
    uptime?: number | undefined;
    responseTime?: number | undefined;
    errorRate?: number | undefined;
    lastError?: string | undefined;
    healthScore?: number | undefined;
    details?: Record<string, any> | undefined;
}, {
    timestamp: string;
    apiStatus: "HEALTHY" | "DEGRADED" | "DOWN" | "UNKNOWN";
    uptime?: number | undefined;
    responseTime?: number | undefined;
    errorRate?: number | undefined;
    lastError?: string | undefined;
    healthScore?: number | undefined;
    details?: Record<string, any> | undefined;
}>;
export declare const PartnerCapabilitySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    details: z.ZodRecord<z.ZodString, z.ZodAny>;
    sourceType: z.ZodEnum<["MANUAL", "API_DISCOVERY", "DOCUMENTATION", "RATE_CARD", "FORM_SUBMISSION"]>;
    sourceData: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    details: Record<string, any>;
    category: string;
    sourceType: "MANUAL" | "API_DISCOVERY" | "DOCUMENTATION" | "RATE_CARD" | "FORM_SUBMISSION";
    description?: string | undefined;
    sourceData?: Record<string, any> | undefined;
}, {
    name: string;
    details: Record<string, any>;
    category: string;
    sourceType: "MANUAL" | "API_DISCOVERY" | "DOCUMENTATION" | "RATE_CARD" | "FORM_SUBMISSION";
    description?: string | undefined;
    sourceData?: Record<string, any> | undefined;
}>;
export declare const CreativeSpecSchema: z.ZodObject<{
    format: z.ZodString;
    dimensions: z.ZodObject<{
        width: z.ZodNumber;
        height: z.ZodNumber;
        aspectRatio: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        width: number;
        height: number;
        aspectRatio?: string | undefined;
    }, {
        width: number;
        height: number;
        aspectRatio?: string | undefined;
    }>;
    fileType: z.ZodString;
    maxFileSize: z.ZodNumber;
    requirements: z.ZodRecord<z.ZodString, z.ZodAny>;
    examples: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    requirements: Record<string, any>;
    format: string;
    dimensions: {
        width: number;
        height: number;
        aspectRatio?: string | undefined;
    };
    fileType: string;
    maxFileSize: number;
    examples?: Record<string, any> | undefined;
}, {
    requirements: Record<string, any>;
    format: string;
    dimensions: {
        width: number;
        height: number;
        aspectRatio?: string | undefined;
    };
    fileType: string;
    maxFileSize: number;
    examples?: Record<string, any> | undefined;
}>;
export declare const CampaignPartnerAssociationSchema: z.ZodObject<{
    campaignId: z.ZodString;
    partnerId: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<["ASSOCIATED", "CONFIGURED", "LAUNCHED", "PAUSED", "COMPLETED", "FAILED"]>>;
    budget: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    targeting: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    creative: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    campaignId: string;
    partnerId: string;
    status?: "COMPLETED" | "FAILED" | "ASSOCIATED" | "CONFIGURED" | "LAUNCHED" | "PAUSED" | undefined;
    budget?: Record<string, any> | undefined;
    targeting?: Record<string, any> | undefined;
    creative?: Record<string, any> | undefined;
}, {
    campaignId: string;
    partnerId: string;
    status?: "COMPLETED" | "FAILED" | "ASSOCIATED" | "CONFIGURED" | "LAUNCHED" | "PAUSED" | undefined;
    budget?: Record<string, any> | undefined;
    targeting?: Record<string, any> | undefined;
    creative?: Record<string, any> | undefined;
}>;
export declare const PartnerSearchSchema: z.ZodObject<{
    query: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["DSP", "SOCIAL", "SEARCH", "RETAIL", "VIDEO", "NATIVE", "EMAIL", "AFFILIATE", "OTHER"]>>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "ACTIVE", "INACTIVE", "SUSPENDED", "ARCHIVED"]>>;
    capabilities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    minBudget: z.ZodOptional<z.ZodNumber>;
    maxBudget: z.ZodOptional<z.ZodNumber>;
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sortBy: z.ZodDefault<z.ZodEnum<["name", "type", "status", "createdAt", "updatedAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "type" | "status" | "name" | "createdAt" | "updatedAt";
    sortOrder: "asc" | "desc";
    type?: "SEARCH" | "DSP" | "SOCIAL" | "RETAIL" | "VIDEO" | "NATIVE" | "EMAIL" | "AFFILIATE" | "OTHER" | undefined;
    status?: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED" | undefined;
    query?: string | undefined;
    capabilities?: string[] | undefined;
    minBudget?: number | undefined;
    maxBudget?: number | undefined;
}, {
    type?: "SEARCH" | "DSP" | "SOCIAL" | "RETAIL" | "VIDEO" | "NATIVE" | "EMAIL" | "AFFILIATE" | "OTHER" | undefined;
    status?: "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED" | undefined;
    query?: string | undefined;
    capabilities?: string[] | undefined;
    minBudget?: number | undefined;
    maxBudget?: number | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: "type" | "status" | "name" | "createdAt" | "updatedAt" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const BulkPartnerOperationSchema: z.ZodObject<{
    partnerIds: z.ZodArray<z.ZodString, "many">;
    operation: z.ZodEnum<["ACTIVATE", "DEACTIVATE", "SUSPEND", "ARCHIVE", "DELETE"]>;
    reason: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    partnerIds: string[];
    operation: "DELETE" | "ACTIVATE" | "DEACTIVATE" | "SUSPEND" | "ARCHIVE";
    reason?: string | undefined;
}, {
    partnerIds: string[];
    operation: "DELETE" | "ACTIVATE" | "DEACTIVATE" | "SUSPEND" | "ARCHIVE";
    reason?: string | undefined;
}>;
export declare const CapabilityComparisonSchema: z.ZodObject<{
    partnerIds: z.ZodArray<z.ZodString, "many">;
    categories: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeSpecs: z.ZodDefault<z.ZodBoolean>;
    includePricing: z.ZodDefault<z.ZodBoolean>;
    format: z.ZodDefault<z.ZodEnum<["MATRIX", "DETAILED", "SUMMARY"]>>;
}, "strip", z.ZodTypeAny, {
    format: "MATRIX" | "DETAILED" | "SUMMARY";
    partnerIds: string[];
    includeSpecs: boolean;
    includePricing: boolean;
    categories?: string[] | undefined;
}, {
    partnerIds: string[];
    format?: "MATRIX" | "DETAILED" | "SUMMARY" | undefined;
    categories?: string[] | undefined;
    includeSpecs?: boolean | undefined;
    includePricing?: boolean | undefined;
}>;
export type PartnerType = z.infer<typeof PartnerTypeSchema>;
export type PartnerStatus = z.infer<typeof PartnerStatusSchema>;
export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>;
export type ApiStatus = z.infer<typeof ApiStatusSchema>;
export type CampaignPartnerStatus = z.infer<typeof CampaignPartnerStatusSchema>;
export type CapabilitySourceType = z.infer<typeof CapabilitySourceTypeSchema>;
export type CreatePartnerRequest = z.infer<typeof CreatePartnerSchema>;
export type UpdatePartnerRequest = z.infer<typeof UpdatePartnerSchema>;
export type PartnerHealthMetric = z.infer<typeof PartnerHealthMetricSchema>;
export type PartnerCapability = z.infer<typeof PartnerCapabilitySchema>;
export type CreativeSpec = z.infer<typeof CreativeSpecSchema>;
export type CampaignPartnerAssociation = z.infer<typeof CampaignPartnerAssociationSchema>;
export type PartnerSearchRequest = z.infer<typeof PartnerSearchSchema>;
export type BulkPartnerOperation = z.infer<typeof BulkPartnerOperationSchema>;
export type CapabilityComparison = z.infer<typeof CapabilityComparisonSchema>;
//# sourceMappingURL=partner.d.ts.map