'use strict'

const endpoint = process.env.API_ENDPOINT || 'http://localhost:3000'
const apiToken = process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBsYXR6aSIsImFkbWluIjp0cnVlLCJwZXJzc2lvbnMiOlsibWV0cmljczpyZWFkIl0sImlhdCI6MTU5MDYwNjA0N30.3nN3KbvbDd8TOTF0FyxYcPo7Xh1srMqWx9q6gaf_z4A'

module.exports = {
  endpoint,
  apiToken
}