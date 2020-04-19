
# Server class:

- getBuilds():setInterval -> YNDX.get('/build/list')
- processBuildList()
    - runBuildOnAgent() -> Agent.api.post -> Agent@route('/build') -> Agent:processBuildFromAgent()
- processBuildResult() <- Agent:sendBuildResultToServer()
    - saveBuildResultToStore() -> YNDX.post('/build/finish')

- registerAgent() <- Agent:registerOnServer()

# Agent class:

- registerOnServer() -> Server.api.post -> Server@route('/notify-agent') -> Server:registerAgent()
- processBuildFromAgent() <- Server:runBuildOnAgent()
- sendBuildResultToServer() -> server.api.post -> Server@route('/notify-build-result') -> Server:processBuildResult()
