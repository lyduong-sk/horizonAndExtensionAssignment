import nunjucks from 'nunjucks'
import * as fs from 'fs'
import prompt from 'prompt'

try {
  const toRender = JSON.parse(fs.readFileSync('.template/templates.json'))

  const props = new Set()
  toRender.map(r => {
    r.props.map(p => props.add(p))
  })

  prompt.message = 'Please enter a project'
  prompt.get(Array.from(props), function (err, result) {
    toRender.forEach(r => {
      const fileContent = nunjucks.render(`.template/${r.filename}`, result)
      fs.writeFileSync(`${r.outputDirectory}/${r.outputFilename}`, fileContent)
    })
  })
} catch (e) {
  console.error(e)
}
