function getOption() {
  const instance = "mstdn.jp";

  const searchRegExp = /crypko|くりぷ(こ|子)|クリプ(コ|子)/gi;

  // すべてのtootを流す
  const testModeFlag = false;
  return {
    instance,
    searchRegExp,
    testModeFlag,
  };
}

function update(text) {
  const div = document.getElementById("articles-container");
  const content = `<p>${text}</p>`;
  div.innerHTML = `<article>${content}</article>${div.innerHTML}`;
}

function connect(instance, searchRegExp, testModeFlag) {
  const ws = new WebSocket(`wss://${instance}/api/v1/streaming?stream=public`);

  ws.onopen = function onopen() {
    update("Connected.");
  };

  ws.onerror = function onerror(error) {
    update("Connection Error");
    // TODO: エラーメッセージを画面に出したい
    console.log(error);
  };

  ws.onmessage = function onmessage(e) {
    // console.log(JSON.parse(JSON.parse(e.data)['payload']));
    const data = JSON.parse(e.data);
    if (data.event === "update") {
      const toot = JSON.parse(data.payload);
      const text = toot.content;
      let hit = false;
      if (searchRegExp.test(text)) {
        hit = true;
      }

      if (hit || testModeFlag) {
        console.log(toot);
        const div = document.getElementById("articles-container");

        const iconHtml = `<a href="${toot.account.url}" target="_blank" ><img src="${toot.account.avatar}" class="icon"></a>`;
        const nameHtml = `<a href="${toot.account.url}" target="_blank" class="name">${toot.account.display_name}<span class="username">${toot.account.username}@${toot.account.url.match(/https:\/\/(.*?)\//)[1]}</span></a>`;
        const timeHtml = `<a href="${toot.url}" class="time" target="_blank">${moment(toot.created_at).format("h:mm")}</a>`;
        const contentHtml = `<div class="text">${toot.content}</div>`;
        div.innerHTML = `<article><header>${iconHtml}${nameHtml}${timeHtml}</header>${contentHtml}</article>${div.innerHTML}`;
      }
    }
  };
}

const option = getOption();
connect(option.instance, option.searchRegExp, option.testModeFlag);
