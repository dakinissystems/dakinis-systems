const fs = require('fs')
const m = fs.readFileSync(0, 'utf8')
process.stdout.write(m.split(/\n/).filter((l) => !/^Co-authored-by: Cursor/.test(l)).join('\n'))
