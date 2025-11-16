/**
 * 测试 lib/utils/validators.ts 中的验证函数
 */
import { describe, it, expect } from 'vitest'
import {
    isValidEmail,
    isValidUrl,
    isValidPhone,
    validatePassword,
    validateUsername,
    isInRange,
    validateLength,
    isEmpty,
    isNumber,
    isInteger,
    validateRating,
} from '@/lib/utils/validators'

describe('Email Validation', () => {
    it('should validate correct emails', () => {
        const validEmails = [
            'test@example.com',
            'user.name@example.com',
            'user+tag@example.co.uk',
        ]
        validEmails.forEach((email) => {
            expect(isValidEmail(email)).toBe(true)
        })
    })

    it('should reject invalid emails', () => {
        const invalidEmails = ['invalid', '@example.com', 'user@', '', 'user @example.com']
        invalidEmails.forEach((email) => {
            expect(isValidEmail(email)).toBe(false)
        })
    })
})

describe('URL Validation', () => {
    it('should validate correct URLs', () => {
        const validUrls = [
            'http://example.com',
            'https://example.com',
            'https://example.com/path',
            'https://example.com:8080',
        ]
        validUrls.forEach((url) => {
            expect(isValidUrl(url)).toBe(true)
        })
    })

    it('should reject invalid URLs', () => {
        const invalidUrls = ['not-a-url', 'ftp://example.com', '', 'example.com']
        invalidUrls.forEach((url) => {
            expect(isValidUrl(url)).toBe(false)
        })
    })
})

describe('Phone Validation', () => {
    it('should validate correct phone numbers', () => {
        const validPhones = ['13800138000', '15912345678', '18612345678']
        validPhones.forEach((phone) => {
            expect(isValidPhone(phone)).toBe(true)
        })
    })

    it('should reject invalid phone numbers', () => {
        const invalidPhones = ['12345', '1234567890', '', '138001380001']
        invalidPhones.forEach((phone) => {
            expect(isValidPhone(phone)).toBe(false)
        })
    })
})

describe('Password Validation', () => {
    it('should validate strong passwords', () => {
        const result = validatePassword('Password123')
        expect(result.valid).toBe(true)
        expect(result.strength).toBe('strong')
    })

    it('should detect medium strength passwords', () => {
        const result = validatePassword('password123')
        expect(result.valid).toBe(true)
        expect(result.strength).toBe('medium')
    })

    it('should detect weak passwords', () => {
        const result = validatePassword('password')
        expect(result.valid).toBe(true)
        expect(result.strength).toBe('weak')
    })

    it('should reject too short passwords', () => {
        const result = validatePassword('short')
        expect(result.valid).toBe(false)
        expect(result.message).toContain('至少')
    })

    it('should reject too long passwords', () => {
        const result = validatePassword('a'.repeat(129))
        expect(result.valid).toBe(false)
        expect(result.message).toContain('不能超过')
    })
})

describe('Username Validation', () => {
    it('should validate correct usernames', () => {
        const result = validateUsername('user123')
        expect(result.valid).toBe(true)
    })

    it('should reject too short usernames', () => {
        const result = validateUsername('ab')
        expect(result.valid).toBe(false)
        expect(result.message).toContain('至少')
    })

    it('should reject too long usernames', () => {
        const result = validateUsername('a'.repeat(21))
        expect(result.valid).toBe(false)
        expect(result.message).toContain('不能超过')
    })

    it('should reject usernames with invalid characters', () => {
        const result = validateUsername('user name')
        expect(result.valid).toBe(false)
        expect(result.message).toContain('字母、数字')
    })
})

describe('Range Validation', () => {
    it('should validate values in range', () => {
        expect(isInRange(5, 0, 10)).toBe(true)
        expect(isInRange(0, 0, 10)).toBe(true)
        expect(isInRange(10, 0, 10)).toBe(true)
    })

    it('should reject values out of range', () => {
        expect(isInRange(-1, 0, 10)).toBe(false)
        expect(isInRange(11, 0, 10)).toBe(false)
    })
})

describe('Length Validation', () => {
    it('should validate correct lengths', () => {
        expect(validateLength('test', 1, 10).valid).toBe(true)
        expect(validateLength('a', 1, 10).valid).toBe(true)
        expect(validateLength('a'.repeat(10), 1, 10).valid).toBe(true)
    })

    it('should reject invalid lengths', () => {
        expect(validateLength('', 1, 10).valid).toBe(false)
        expect(validateLength('a'.repeat(11), 1, 10).valid).toBe(false)
    })
})

describe('Empty Check', () => {
    it('should detect empty values', () => {
        expect(isEmpty(null)).toBe(true)
        expect(isEmpty(undefined)).toBe(true)
        expect(isEmpty('')).toBe(true)
        expect(isEmpty('   ')).toBe(true)
        expect(isEmpty([])).toBe(true)
        expect(isEmpty({})).toBe(true)
    })

    it('should detect non-empty values', () => {
        expect(isEmpty('test')).toBe(false)
        expect(isEmpty(' test ')).toBe(false)
        expect(isEmpty([1, 2, 3])).toBe(false)
        expect(isEmpty({ key: 'value' })).toBe(false)
        expect(isEmpty(0)).toBe(false)
    })
})

describe('Number Validation', () => {
    it('should validate numbers', () => {
        expect(isNumber(123)).toBe(true)
        expect(isNumber('123')).toBe(true)
        expect(isNumber('123.45')).toBe(true)
    })

    it('should reject non-numbers', () => {
        expect(isNumber('abc')).toBe(false)
        expect(isNumber('')).toBe(false)
        expect(isNumber(null)).toBe(false)
    })

    it('should validate integers', () => {
        expect(isInteger(123)).toBe(true)
        expect(isInteger('123')).toBe(true)
    })

    it('should reject non-integers', () => {
        expect(isInteger(123.45)).toBe(false)
        expect(isInteger('123.45')).toBe(false)
        expect(isInteger('abc')).toBe(false)
    })
})

describe('Rating Validation', () => {
    it('should validate correct ratings', () => {
        for (let i = 0; i <= 10; i++) {
            const result = validateRating(i)
            expect(result.valid).toBe(true)
        }
    })

    it('should reject invalid ratings', () => {
        const invalidRatings = [-1, 11, 100]
        invalidRatings.forEach((rating) => {
            const result = validateRating(rating)
            expect(result.valid).toBe(false)
            expect(result.message).toContain('0-10')
        })
    })
})
