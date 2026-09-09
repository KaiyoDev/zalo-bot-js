function parseCommand(text, botAccountName) {
  if (!text) return undefined;

  let normalized = text.trim();

  if (normalized.includes('@') && !normalized.startsWith('/')) {
    if (botAccountName) {
      const escapedName = botAccountName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const mentionRegex = new RegExp('^@' + escapedName + '\\s+', 'i');
      normalized = normalized.replace(mentionRegex, '');
    } else {
      const mentionMatch = normalized.match(/^@[^\s/]+\s+/i);
      if (mentionMatch) {
        normalized = normalized.slice(mentionMatch[0].length);
      }
    }
  }

  console.log('  After strip:', normalized);

  if (!normalized.startsWith('/') || normalized.length <= 1) {
    return undefined;
  }

  const body = normalized.slice(1);
  const [rawName, ...rest] = body.split(/\s+/);
  const name = rawName.trim();
  if (!name) return undefined;

  const argsRaw = rest.join(' ').trim();
  return { name, argsRaw, args: argsRaw ? argsRaw.split(/\s+/) : [] };
}

console.log('Test 1 - Private chat:');
console.log(parseCommand('/start', 'Bot icheck'));

console.log('\nTest 2 - Group with @mention:');
console.log(parseCommand('@Bot icheck /start', 'Bot icheck'));

console.log('\nTest 3 - Group with @mention + args (with /):');
console.log(parseCommand('@Bot icheck /info arg1 arg2', 'Bot icheck'));

console.log('\nTest 4 - Group without @mention:');
console.log(parseCommand('hello', 'Bot icheck'));

console.log('\nTest 5 - Group @mention no command:');
console.log(parseCommand('@Bot icheck hello', 'Bot icheck'));
