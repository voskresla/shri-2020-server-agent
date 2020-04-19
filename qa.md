
# Server class:

- ✅ getBuilds():setInterval -> YNDX.get('/build/list')
- ✅ processBuildList()
    - ✅ runBuildOnAgent() -> Agent.api.post -> Agent@route('/build') -> Agent:processBuildFromAgent()
- ✅ processBuildResult() <- Agent:sendBuildResultToServer()
    - ✅ saveBuildResultToStore() -> YNDX.post('/build/finish')

- ✅ registerAgent() <- Agent:registerOnServer()

# Agent class:

- ✅ registerOnServer() -> Server.api.post -> Server@route('/notify-agent') -> Server:registerAgent()
- processBuild() <- Server:runBuildOnAgent()
- ✅ sendBuildResultToServer() -> server.api.post -> Server@route('/notify-build-result') -> Server:processBuildResult()


# CONSTRAINTS

- пока не проверяем живые ли агенты. Если зарегались - значит живые. 

# TODO

- ✅ агент должен сообщать что он уже зарегестрирован, если его пытаются зарегестрировать еще раз.
- добавить веб монитор по агентам
- найти ошибку когда иногда проваливается CiServer: processBuildResult()
- перенести настройки из .env в config.json
- прикрутить асинхроннную очередь из BFF, который для React-приложения.
- протестировать с несколькими агентами.
- реализовать работу с git и fs.
