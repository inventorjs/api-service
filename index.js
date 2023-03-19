import http from 'http'

const server = http.createServer((req, res) => {
  res.statusCode = 302
  //res.end('ok')
})
server.listen(8000)
