import { parseKeyField } from "../parse-key"

describe('Utils', () => {
    // test('Bulk', () => {
    //     expect(1).toBe(1)
    // })
    test('Parse Key-Field must run correctly', () => {
        expect(parseKeyField('abcde')).toEqual(['abc', 'de'])
        expect(parseKeyField('abcd')).toEqual(['ab', 'cd'])
    })

    test('Parse Key-Field must throw when receive invalid key', () => {
        expect(() => parseKeyField('ab')).toThrow()
        expect(() => parseKeyField('a')).toThrow()
    })
})