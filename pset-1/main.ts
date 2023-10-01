import { synthesizeProgram } from './bottom-up-synthesizer.ts';
import { Example } from './example.ts';

function main() {
  console.log('Hello, world!');

  const examples: Example[] = [
    new Example('input', 'output'),
    new Example('input', 'output'),
    new Example('input', 'output'),
  ];

  const functionConstructed = synthesizeProgram(examples);
}

main();
