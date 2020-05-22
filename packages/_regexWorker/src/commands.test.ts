import { isEchoCommand, isCommand, CommandNames } from './commands';


describe('Commands', () => {
    it('isA', () => {
        expect(isEchoCommand({})).toBe(false);
        expect(isEchoCommand({ id: 1, commandType: 'Echo'})).toBe(true);
        expect(isCommand({ id: 5, commandType: 'Other'})).toBe(false);
        expect(isCommand({ id: 5, commandType: CommandNames.EvaluateRegExp})).toBe(true);
    });
});
