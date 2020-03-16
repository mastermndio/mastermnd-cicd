const remark = require('remark');
const linter = require('../');

const linEol = '\n';
const winEol = '\r\n';

describe("Valid content should generate no message", () => {

    const validMixed =
    `The first line is correct.${linEol}` +
    `The second line is correct as well.${winEol}` +
    `.${linEol}`

    const validLinux = validMixed.replace(winEol, linEol);
    const validWindows = validMixed.replace(linEol, winEol);

    test.each(
        [
            ["Linux", validLinux],
            ["Windows", validWindows],
            ["mixed", validMixed],
        ]
    )(
        'With %s line endings',
        (desc, sampleText) => {

        const output = remark().use(linter).processSync(sampleText);

        expect(output.messages).toHaveLength(0);
    });
});

describe("Invalid content should generate messages", () => {

    const invalidMixed =
    `The first line is bearing trailing whitespaces.\t${linEol}` +
    `The second line as well. ${linEol}` +
    `The third line is corrrect.${winEol}` +
    `\v${linEol}`

    const invalidLinux = invalidMixed.replace(winEol, linEol);
    const invalidWindows = invalidMixed.replace(linEol, winEol);

    test.each(
        [
            ["Linux", invalidLinux],
            ["Windows", invalidWindows],
            ["mixed", invalidMixed],
        ]
    )(
        'With %s line endings',
        (desc, sampleText) => {

        const output = remark().use(linter).processSync(sampleText);

        expect(output.messages).toHaveLength(3);

        output.messages.forEach(m => {
            expect(m.line).not.toEqual(3);
        })
    });
});