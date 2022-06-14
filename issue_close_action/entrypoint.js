const core = require('@actions/core');
const github = require('@actions/github');

const targetProject = "ZREQ"

function getLinkToJira(){
  const context = github.context;
  if (context.payload.issue == null) {
      core.setFailed('No issue found.');
      return;
  }
  
  console.log("issue number is "+context.payload.issue.number)
  body = context.payload.issue.body
  s_idx = body.indexOf(targetProject)
  if (s_idx < 0 ) {
      core.setFailed('No link(to jira) found.');
      return;
  }
  e_idx = body.indexOf("\n", s_idx)
  if (e_idx < 0 ) {
      core.setFailed('invalid link(to jira) found.');
      return;
  }
  linkto = body.substring(s_idx, e_idx-1)
  
  console.log(linkto+"("+s_idx+ ", " + e_idx+ ") from \n"+body)
  
  return linkto
}

async function replyToJira(linkto){
  const fetchP = import('node-fetch').then(mod => mod.default)
  const fetch = (...args) => fetchP.then(fn => fn(...args))

  const bodyData = `{
    "body": {
      "type": "doc",
      "version": 1,
      "content": [
        { "type": "paragraph",
          "content": [ { "text": "issue closed", "type": "text"} ]}
      ]
    }
  }`;

  url = 'https://my-atlassian-site-009117.atlassian.net/rest/api/3/issue/'+linkto+'/comment'
  auth1 = core.getInput('input')
  
  console.log("url : "+url+ ", " + "auth : " +auth1)
  fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${Buffer.from(
      auth1
    ).toString('base64')}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: bodyData
  })
  .then(response => {
    console.log(
      `Response: ${response.status} ${response.statusText}`
    );
    return response.text();
  })
  .then(text => console.log(text))
  .catch(err => console.error(err));  
}

linkto = getLinkToJira()
if (linkto != null) {
  replyToJira(linkto)
}  

